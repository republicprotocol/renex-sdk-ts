import BigNumber from "bignumber.js";
import Web3 from "web3";

import BN from "bn.js";
import { PromiEvent } from "web3-core";
import { provider } from "web3-providers";

import LocalStorage from "./storage/localStorage";

import { DarknodeRegistry, Orderbook, RenExBalances, RenExSettlement, RenExTokens, withProvider, Wyre } from "./contracts/contracts";
import { errors, updateError } from "./errors";
import { generateConfig } from "./lib/config";
import { normalizePrice, normalizeVolume, toOriginalType } from "./lib/conversion";
import { EncodedData, Encodings } from "./lib/encodedData";
import { fetchMarkets } from "./lib/market";
import { NetworkData, networks } from "./lib/network";
import { supportedTokens } from "./lib/tokens";
import { atomConnected, atomicAddresses, atomicBalances, authorizeAtom, currentAtomConnectionStatus, getSwapperID, refreshAtomConnectionStatus, resetAtomConnection, supportedAtomicTokens } from "./methods/atomicMethods";
import { updateAllBalanceActionStatuses, updateBalanceActionStatus, withdraw } from "./methods/balanceActionMethods";
import { balances } from "./methods/balancesMethods";
import { getGasPrice } from "./methods/generalMethods";
import { cancelOrder, getMinEthTradeVolume, getOrderBlockNumber, getOrders, openOrder, updateAllOrderStatuses } from "./methods/orderbookMethods";
import { darknodeFees, fetchOrderStatus, matchDetails } from "./methods/settlementMethods";
import { fetchBalanceActions, fetchTraderOrders } from "./methods/storageMethods";
import { unwrap, wrap, wrappingFees } from "./methods/wrapTokenMethods";
import { FileSystemStorage } from "./storage/fileSystemStorage";
import { StorageProvider } from "./storage/interface";
import { MemoryStorage } from "./storage/memoryStorage";
import { AtomicBalanceDetails, AtomicConnectionStatus, BalanceAction, BalanceDetails, Config, MarketDetails, MatchDetails, NumberInput, Options, Order, OrderbookFilter, OrderID, OrderInputs, OrderSide, OrderStatus, Token, TokenCode, TraderOrder, Transaction, TransactionOptions, TransactionStatus, WBTCOrder, WithdrawTransactionOptions } from "./types";

// Contract bindings
import { DarknodeRegistryContract } from "./contracts/bindings/darknode_registry";
import { ERC20Contract } from "./contracts/bindings/erc20";
import { OrderbookContract } from "./contracts/bindings/orderbook";
import { RenExBalancesContract } from "./contracts/bindings/ren_ex_balances";
import { RenExSettlementContract } from "./contracts/bindings/ren_ex_settlement";
import { RenExTokensContract } from "./contracts/bindings/ren_ex_tokens";
import { WyreContract } from "./contracts/bindings/wyre";

// Export all types
export * from "./types";
export { errors } from "./errors";
export { StorageProvider } from "./storage/interface";
export { deserializeBalanceAction, deserializeTraderOrder, serializeBalanceAction, serializeTraderOrder } from "./storage/serializers";

/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class RenExSDK
 */
export class RenExSDK {
    public errors = errors;

    public _networkData: NetworkData;
    public _atomConnectionStatus: AtomicConnectionStatus = AtomicConnectionStatus.NotConnected;
    public _atomConnectedAddress: string = "";

    public _storage: StorageProvider;
    public _contracts: {
        renExSettlement: RenExSettlementContract,
        renExTokens: RenExTokensContract,
        renExBalances: RenExBalancesContract,
        orderbook: OrderbookContract,
        darknodeRegistry: DarknodeRegistryContract,
        erc20: Map<TokenCode, ERC20Contract>,
        wyre: WyreContract,
    };

    public _cachedTokenDetails: Map<TokenCode, Promise<{ addr: string, decimals: string | number | BN, registered: boolean }>> = new Map();

    // Atomic functions
    public swapperd = {
        getStatus: (): AtomicConnectionStatus => currentAtomConnectionStatus(this),
        getID: (): Promise<string> => getSwapperID(this),
        isConnected: (): boolean => atomConnected(this),
        refreshStatus: (): Promise<AtomicConnectionStatus> => refreshAtomConnectionStatus(this),
        resetStatus: (): Promise<AtomicConnectionStatus> => resetAtomConnection(this),
        authorize: (): Promise<AtomicConnectionStatus> => authorizeAtom(this),
        fetchBalances: (tokens: TokenCode[]): Promise<Map<TokenCode, AtomicBalanceDetails>> => atomicBalances(this, tokens),
        fetchAddresses: (tokens: TokenCode[]): Promise<string[]> => atomicAddresses(this, tokens),
        wrap: (amount: NumberInput, token: TokenCode): Promise<WBTCOrder> => wrap(this, amount, token),
        unwrap: (amount: NumberInput, token: TokenCode): Promise<WBTCOrder> => unwrap(this, amount, token),
    };

    public atom = this.swapperd;

    public utils = {
        normalizePrice: (price: NumberInput, roundUp?: boolean): NumberInput => {
            return toOriginalType(normalizePrice(new BigNumber(price), roundUp), price);
        },
        normalizeVolume: (volume: NumberInput, roundUp?: boolean): NumberInput => {
            return toOriginalType(normalizeVolume(new BigNumber(volume), roundUp), volume);
        },
        normalizeOrder: (order: OrderInputs): OrderInputs => {
            const newOrder: OrderInputs = Object.assign(order, {});
            newOrder.price = this.utils.normalizePrice(order.price, order.side === OrderSide.SELL);
            newOrder.volume = this.utils.normalizeVolume(order.volume);
            if (order.minVolume) {
                newOrder.minVolume = this.utils.normalizeVolume(order.minVolume);
            }
            return newOrder;
        },
    };

    private _web3: Web3;
    private _address: string = "";
    private _config: Config;

    /**
     * Creates an instance of RenExSDK.
     * @param {provider} web3Provider
     * @memberof RenExSDK
     */
    constructor(web3Provider: provider, options?: Options) {
        this._web3 = new Web3(web3Provider);
        this._config = generateConfig(options);

        switch (this.getConfig().network) {
            case "mainnet":
                this._networkData = networks.mainnet;
                break;
            case "testnet":
                this._networkData = networks.testnet;
                break;
            default:
                throw new Error(`Unsupported network field: ${this.getConfig().network}`);
        }

        // Show warning when the expected network ID is different from the provider network ID
        this._web3.eth.net.getId()
            .then(networkId => {
                if (networkId !== this._networkData.ethNetworkId) {
                    console.warn(`Incorrect provider network! Your provider should be using the ${this._networkData.ethNetworkLabel} Ethereum network!`);
                }
            })
            .catch(console.error);

        this._cachedTokenDetails = this._cachedTokenDetails
            .set(Token.BTC, Promise.resolve({ addr: "0x0000000000000000000000000000000000000000", decimals: new BN(8), registered: true }))
            .set(Token.ETH, Promise.resolve({ addr: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: new BN(18), registered: true }))
            .set(Token.DGX, Promise.resolve({ addr: this._networkData.tokens.DGX, decimals: new BN(9), registered: true }))
            .set(Token.TUSD, Promise.resolve({ addr: this._networkData.tokens.TUSD, decimals: new BN(18), registered: true }))
            .set(Token.REN, Promise.resolve({ addr: this._networkData.tokens.REN, decimals: new BN(18), registered: true }))
            .set(Token.ZRX, Promise.resolve({ addr: this._networkData.tokens.ZRX, decimals: new BN(18), registered: true }))
            .set(Token.OMG, Promise.resolve({ addr: this._networkData.tokens.OMG, decimals: new BN(18), registered: true }))
            .set(Token.WBTC, Promise.resolve({ addr: this._networkData.tokens.WBTC, decimals: new BN(8), registered: true }));

        this._storage = this.setupStorageProvider();

        // Hack to suppress web3 MaxListenersExceededWarning
        // This should be removed when issue is resolved upstream:
        // https://github.com/ethereum/web3.js/issues/1648
        process.listeners("warning").forEach(listener => process.removeListener("warning", listener));

        this._contracts = {
            renExSettlement: new (withProvider(this.getWeb3().currentProvider, RenExSettlement))(this._networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.getWeb3().currentProvider, RenExBalances))(this._networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.getWeb3().currentProvider, Orderbook))(this._networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(this.getWeb3().currentProvider, DarknodeRegistry))(this._networkData.contracts[0].darknodeRegistry),
            renExTokens: new (withProvider(this.getWeb3().currentProvider, RenExTokens))(this._networkData.contracts[0].renExTokens),
            erc20: new Map<TokenCode, ERC20Contract>(),
            wyre: new (withProvider(this.getWeb3().currentProvider, Wyre))(this._networkData.contracts[0].wyre),
        };
    }

    public fetchBalances = (tokens: TokenCode[]): Promise<Map<TokenCode, BalanceDetails>> => balances(this, tokens);
    public fetchBalanceActionStatus = (txHash: string): Promise<TransactionStatus> => updateBalanceActionStatus(this, txHash);
    public fetchOrderStatus = (orderID: OrderID): Promise<OrderStatus> => fetchOrderStatus(this, orderID);
    public fetchMatchDetails = (orderID: OrderID): Promise<MatchDetails | undefined> => matchDetails(this, orderID);
    public fetchOrderbook = (filter: OrderbookFilter): Promise<Order[]> => getOrders(this, filter);
    public fetchOrderBlockNumber = (orderID: OrderID): Promise<number> => getOrderBlockNumber(this, orderID);

    // public fetchAtomicMarkets = ()
    public fetchMarkets = (): Promise<MarketDetails[]> => fetchMarkets(this);
    public fetchSupportedTokens = (): Promise<TokenCode[]> => supportedTokens(this);
    public fetchSupportedAtomicTokens = (): Promise<TokenCode[]> => supportedAtomicTokens(this);

    // Transaction Methods
    public withdraw = (value: NumberInput, token: TokenCode, options?: WithdrawTransactionOptions):
        Promise<{ balanceAction: BalanceAction, promiEvent: PromiEvent<Transaction> | null }> =>
        withdraw(this, value, token, options)
    public openOrder = (order: OrderInputs, options?: TransactionOptions):
        Promise<{ traderOrder: TraderOrder, promiEvent: PromiEvent<Transaction> | null }> =>
        openOrder(this, order, options)
    public cancelOrder = (orderID: OrderID, options?: TransactionOptions):
        Promise<{ promiEvent: PromiEvent<Transaction> | null }> =>
        cancelOrder(this, orderID, options)

    public fetchDarknodeFeePercent = (): Promise<BigNumber> => darknodeFees(this);
    public fetchWrappingFeePercent = (): Promise<BigNumber> => wrappingFees(this);
    public fetchMinEthTradeVolume = (): Promise<BigNumber> => getMinEthTradeVolume(this);
    public fetchGasPrice = (): Promise<string | undefined> => getGasPrice(this);

    // Storage functions
    public fetchTraderOrders = (options = { refresh: true }): Promise<TraderOrder[]> => fetchTraderOrders(this, options);
    public fetchBalanceActions = (options = { refresh: true }): Promise<BalanceAction[]> => fetchBalanceActions(this, options);
    public refreshBalanceActionStatuses = async (): Promise<Map<string, TransactionStatus>> => updateAllBalanceActionStatuses(this);
    public refreshOrderStatuses = async (): Promise<Map<string, OrderStatus>> => updateAllOrderStatuses(this);

    // Provider / account functions
    public getWeb3 = (): Web3 => this._web3;
    public getAddress = (): string => this._address;
    public getConfig = (): Config => this._config;

    public setAddress = (addr: string): void => {
        const address = addr === "" ? "" : new EncodedData(addr, Encodings.HEX).toHex();
        this._address = address;
        this._storage = this.setupStorageProvider();
    }

    public updateProvider = (web3Provider: provider): void => {
        this._web3 = new Web3(web3Provider);

        // Update contract providers
        this._contracts = {
            renExSettlement: new (withProvider(this.getWeb3().currentProvider, RenExSettlement))(this._networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.getWeb3().currentProvider, RenExBalances))(this._networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.getWeb3().currentProvider, Orderbook))(this._networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(this.getWeb3().currentProvider, DarknodeRegistry))(this._networkData.contracts[0].darknodeRegistry),
            renExTokens: new (withProvider(this.getWeb3().currentProvider, RenExTokens))(this._networkData.contracts[0].renExTokens),
            erc20: new Map<TokenCode, ERC20Contract>(),
            wyre: new (withProvider(this.getWeb3().currentProvider, Wyre))(this._networkData.contracts[0].wyre),
        };
    }

    private setupStorageProvider = (): StorageProvider => {
        switch (this.getConfig().storageProvider) {
            case "none":
                return new MemoryStorage();
            case "localStorage":
                return new LocalStorage(this._address);
            default:
                try {
                    if (typeof this.getConfig().storageProvider === "string") {
                        // Use storageProvider as a path to FileSystemStorage
                        return new FileSystemStorage(this.getConfig().storageProvider as string, this._address);
                    } else {
                        // storageProvider is an object so use it as is
                        return this.getConfig().storageProvider as StorageProvider;
                    }
                } catch (error) {
                    throw updateError(`Unsupported storage option: ${this.getConfig().storageProvider}: ${error.message || error}`, error);
                }
        }
    }

}

export default RenExSDK;
