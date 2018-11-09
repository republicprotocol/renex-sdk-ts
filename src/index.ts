import BigNumber from "bignumber.js";
import Web3 from "web3";

import { BN } from "bn.js";

import { PromiEvent, Provider } from "web3/types";

import LocalStorage from "./storage/localStorage";

import { DarknodeRegistry, Orderbook, RenExBalances, RenExSettlement, RenExTokens, withProvider, Wyre } from "./contracts/contracts";
import { generateConfig } from "./lib/config";
import { normalizePrice, normalizeVolume } from "./lib/conversion";
import { fetchMarkets } from "./lib/market";
import { NetworkData, networks } from "./lib/network";
import { supportedTokens } from "./lib/tokens";
import { atomConnected, atomicAddresses, atomicBalances, authorizeAtom, currentAtomConnectionStatus, refreshAtomConnectionStatus, resetAtomConnection, supportedAtomicTokens } from "./methods/atomicMethods";
import { deposit, updateAllBalanceActionStatuses, updateBalanceActionStatus, withdraw } from "./methods/balanceActionMethods";
import { balances } from "./methods/balancesMethods";
import { getGasPrice } from "./methods/generalMethods";
import { cancelOrder, getMinEthTradeVolume, getOrders, openOrder, updateAllOrderStatuses } from "./methods/orderbookMethods";
import { darknodeFees, matchDetails, status } from "./methods/settlementMethods";
import { fetchBalanceActions, fetchTraderOrders } from "./methods/storageMethods";
import { StorageProvider } from "./storage/interface";
import { MemoryStorage } from "./storage/memoryStorage";
import { AtomicBalanceDetails, AtomicConnectionStatus, BalanceAction, BalanceDetails, Config, MarketDetails, MatchDetails, NumberInput, Options, Order, OrderbookFilter, OrderID, OrderInputs, OrderStatus, SimpleConsole, Token, TokenCode, TokenDetails, TraderOrder, Transaction, TransactionStatus } from "./types";

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
export { StorageProvider } from "./storage/interface";

/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class RenExSDK
 */
class RenExSDK {

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
    public atom = {
        getStatus: (): AtomicConnectionStatus => currentAtomConnectionStatus(this),
        isConnected: (): boolean => atomConnected(this),
        refreshStatus: (): Promise<AtomicConnectionStatus> => refreshAtomConnectionStatus(this),
        resetStatus: (): Promise<AtomicConnectionStatus> => resetAtomConnection(this),
        authorize: (): Promise<AtomicConnectionStatus> => authorizeAtom(this),
        fetchBalances: (tokens: TokenCode[]): Promise<Map<TokenCode, AtomicBalanceDetails>> => atomicBalances(this, tokens),
        fetchAddresses: (tokens: TokenCode[]): Promise<string[]> => atomicAddresses(tokens),
    };

    public utils = {
        normalizePrice: (price: NumberInput, roundUp?: boolean): BigNumber => normalizePrice(new BigNumber(price), roundUp),
        normalizeVolume: (volume: NumberInput, roundUp?: boolean): BigNumber => normalizeVolume(new BigNumber(volume), roundUp),
    };

    private _web3: Web3;
    private _address: string;
    private _config: Config;

    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, address?: string, options?: Options) {
        this._web3 = new Web3(provider);
        this._address = address ? address : "";
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

        this._cachedTokenDetails = this._cachedTokenDetails
            .set(Token.BTC, Promise.resolve({ addr: "0x0000000000000000000000000000000000000000", decimals: new BN(8), registered: true }))
            .set(Token.ETH, Promise.resolve({ addr: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: new BN(18), registered: true }))
            .set(Token.DGX, Promise.resolve({ addr: this._networkData.tokens.DGX, decimals: new BN(9), registered: true }))
            .set(Token.TUSD, Promise.resolve({ addr: this._networkData.tokens.TUSD, decimals: new BN(18), registered: true }))
            .set(Token.REN, Promise.resolve({ addr: this._networkData.tokens.REN, decimals: new BN(18), registered: true }))
            .set(Token.ZRX, Promise.resolve({ addr: this._networkData.tokens.ZRX, decimals: new BN(18), registered: true }))
            .set(Token.OMG, Promise.resolve({ addr: this._networkData.tokens.OMG, decimals: new BN(18), registered: true }));

        switch (this.getConfig().storageProvider) {
            case "localStorage":
                this._storage = new LocalStorage(this._address);
                break;
            case "memory":
                this._storage = new MemoryStorage();
                break;
            default:
                if (typeof this.getConfig().storageProvider === "string") {
                    throw new Error(`Unsupported storage option: ${this.getConfig().storageProvider}.`);
                }
                this._storage = this.getConfig().storageProvider as StorageProvider;
        }

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
    public fetchOrderStatus = (orderID: OrderID): Promise<OrderStatus> => status(this, orderID);
    public fetchMatchDetails = (orderID: OrderID): Promise<MatchDetails> => matchDetails(this, orderID);
    public fetchOrderbook = (filter: OrderbookFilter): Promise<Order[]> => getOrders(this, filter);

    // public fetchAtomicMarkets = ()
    public fetchMarkets = (): Promise<MarketDetails[]> => fetchMarkets(this);
    public fetchSupportedTokens = (): Promise<TokenCode[]> => supportedTokens(this);
    public fetchSupportedAtomicTokens = (): Promise<TokenCode[]> => supportedAtomicTokens(this);

    // Transaction Methods
    public deposit = (value: NumberInput, token: TokenCode):
        Promise<{ balanceAction: BalanceAction, promiEvent: PromiEvent<Transaction> | null }> =>
        deposit(this, value, token)
    public withdraw = (value: NumberInput, token: TokenCode, withoutIngressSignature = false):
        Promise<{ balanceAction: BalanceAction, promiEvent: PromiEvent<Transaction> | null }> =>
        withdraw(this, value, token, withoutIngressSignature)
    public openOrder = (order: OrderInputs, simpleConsole?: SimpleConsole):
        Promise<{ traderOrder: TraderOrder, promiEvent: PromiEvent<Transaction> | null }> =>
        openOrder(this, order, simpleConsole)
    public cancelOrder = (orderID: OrderID):
        Promise<{ promiEvent: PromiEvent<Transaction> | null }> =>
        cancelOrder(this, orderID)

    public fetchDarknodeFeePercent = (): Promise<BigNumber> => darknodeFees(this);
    public fetchMinEthTradeVolume = (): Promise<BigNumber> => getMinEthTradeVolume(this);
    public fetchGasPrice = (): Promise<number | undefined> => getGasPrice(this);

    // Storage functions
    public fetchTraderOrders = (options = { refresh: true }): Promise<TraderOrder[]> => fetchTraderOrders(this, options);
    public fetchBalanceActions = (options = { refresh: true }): Promise<BalanceAction[]> => fetchBalanceActions(this, options);
    public refreshBalanceActionStatuses = async (): Promise<Map<string, TransactionStatus>> => updateAllBalanceActionStatuses(this);
    public refreshOrderStatuses = async (): Promise<Map<string, OrderStatus>> => updateAllOrderStatuses(this);

    // Provider / account functions
    public getWeb3 = (): Web3 => this._web3;
    public getAddress = (): string => this._address;
    public getConfig = (): Config => this._config;

    public updateProvider = (provider: Provider): void => {
        this._web3 = new Web3(provider);

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

    public updateAddress = (address: string): void => {
        this._address = address;
        if (this.getConfig().storageProvider === "localStorage") {
            this._storage = new LocalStorage(address);
        }
    }
}

export default RenExSDK;
