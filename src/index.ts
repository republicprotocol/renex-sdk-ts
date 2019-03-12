import BigNumber from "bignumber.js";
import Web3 from "web3";

import BN from "bn.js";
import PromiEvent from "web3/promiEvent";

import { OrderedMap } from "immutable";
import { Provider } from "web3/providers";

import { DarknodeRegistry, Orderbook, RenExBalances, RenExSettlement, RenExTokens, withProvider, Wyre } from "./contracts/contracts";
import { errors } from "./errors";
import { generateConfig } from "./lib/config";
import { normalizePrice, normalizeVolume, toOriginalType } from "./lib/conversion";
import { EncodedData, Encodings } from "./lib/encodedData";
import { fetchMarkets } from "./lib/market";
import { NetworkData, networks } from "./lib/network";
import { SwapObject } from "./lib/swapper";
// import { getGasPrice } from "./methods/generalMethods";
import { cancelOrder, getMinEthTradeVolume, openOrder } from "./methods/orderbookMethods";
import { darknodeFees } from "./methods/settlementMethods";
import { currentSwapperDConnectionStatus, getSwapperID, getSwapperVersion, refreshSwapperDConnectionStatus, resetSwapperDConnection, supportedSwapperDTokens, swapperDAddresses, swapperDBalances, swapperDConnected, swapperDSwaps } from "./methods/swapperDMethods";
import { getWrappingFees, unwrap, unwrappingFees, wrap, WrapFees, WrapFeesMap, wrappingFees } from "./methods/wrapTokenMethods";
import {
    Config, MarketDetails, MarketPair, NumberInput,
    Options, OrderID, OrderInputs, OrderSide,
    SwapperDBalanceDetails, SwapperDConnectionStatus, Token,
    TraderOrder, Transaction, TransactionOptions, WBTCOrder,
} from "./types";

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
export * from "./lib/swapper";
export { errors } from "./errors";

/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class RenExSDK
 */
export class RenExSDK {
    public errors = errors;

    public _networkData: NetworkData;
    public _swapperDConnectionStatus: SwapperDConnectionStatus = SwapperDConnectionStatus.NotConnected;
    public _wrappingFees: WrapFeesMap = {};

    public _contracts: {
        renExSettlement: RenExSettlementContract,
        renExTokens: RenExTokensContract,
        renExBalances: RenExBalancesContract,
        orderbook: OrderbookContract,
        darknodeRegistry: DarknodeRegistryContract,
        erc20: Map<Token, ERC20Contract>,
        wyre: WyreContract,
    };

    public _cachedTokenDetails: Map<Token, Promise<{ addr: string, decimals: string | number | BN, registered: boolean }>> = new Map();

    // Atomic functions
    public swapperD = {
        getStatus: (): SwapperDConnectionStatus => currentSwapperDConnectionStatus(this),
        getID: (): Promise<string> => getSwapperID(this),
        getVersion: (): Promise<string> => getSwapperVersion(this),
        isConnected: (): boolean => swapperDConnected(this),
        refreshStatus: (): Promise<SwapperDConnectionStatus> => refreshSwapperDConnectionStatus(this),
        resetStatus: (): Promise<SwapperDConnectionStatus> => resetSwapperDConnection(this),
        // authorize: (): Promise<SwapperDConnectionStatus> => authorizeSwapperD(this),
        fetchBalances: (tokens: Token[]): Promise<Map<Token, SwapperDBalanceDetails>> => swapperDBalances(this, tokens),
        fetchSwaps: (): Promise<SwapObject[]> => swapperDSwaps(this),
        fetchAddresses: (tokens: Token[]): Promise<string[]> => swapperDAddresses(this, tokens),
        wrap: (amount: NumberInput, token: Token): Promise<WBTCOrder> => wrap(this, amount, token),
        unwrap: (amount: NumberInput, token: Token): Promise<WBTCOrder> => unwrap(this, amount, token),
        getWrappingFees: (token: Token): Promise<WrapFees> => getWrappingFees(this, token),
    };

    public atom = this.swapperD;

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
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, options?: Options, mainnetProvider?: Provider) {
        this._web3 = new Web3(provider);
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
            // tslint:disable-next-line: no-any
            .then((networkId: any) => {
                if (networkId !== this._networkData.ethNetworkId) {
                    console.warn(`Incorrect provider network! Your provider should be using the ${this._networkData.ethNetworkLabel} Ethereum network!`);
                }
            })
            .catch(console.error);

        this._cachedTokenDetails = this._cachedTokenDetails
            .set(Token.BTC, Promise.resolve({ addr: "0x0000000000000000000000000000000000000000", decimals: new BN(8), registered: true }))
            .set(Token.ETH, Promise.resolve({ addr: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: new BN(18), registered: true }))
            .set(Token.TUSD, Promise.resolve({ addr: this._networkData.tokens.TUSD, decimals: new BN(18), registered: true }))
            .set(Token.DAI, Promise.resolve({ addr: this._networkData.tokens.DAI, decimals: new BN(18), registered: true }))
            ;

        // Hack to suppress web3 MaxListenersExceededWarning
        // This should be removed when issue is resolved upstream:
        // https://github.com/ethereum/web3.js/issues/1648
        process.listeners("warning").forEach(listener => process.removeListener("warning", listener));

        this._contracts = {
            renExSettlement: new (withProvider(this.getWeb3().currentProvider, RenExSettlement))(this._networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.getWeb3().currentProvider, RenExBalances))(this._networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.getWeb3().currentProvider, Orderbook))(this._networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(mainnetProvider || provider, DarknodeRegistry))("0x34bd421C7948Bc16f826Fd99f9B785929b121633"),
            renExTokens: new (withProvider(this.getWeb3().currentProvider, RenExTokens))(this._networkData.contracts[0].renExTokens),
            erc20: new Map<Token, ERC20Contract>(),
            wyre: new (withProvider(this.getWeb3().currentProvider, Wyre))(this._networkData.contracts[0].wyre),
        };
    }

    // public fetchAtomicMarkets = ()
    public fetchMarkets = (): Promise<OrderedMap<MarketPair, MarketDetails>> => fetchMarkets(this);
    public fetchSupportedSwapperDTokens = (): Promise<Token[]> => supportedSwapperDTokens(this);
    // tslint:disable-next-line: member-ordering
    public fetchSupportedAtomicTokens = this.fetchSupportedSwapperDTokens;

    // Transaction Methods
    public openOrder = (order: OrderInputs, options?: TransactionOptions):
        Promise<{ traderOrder: TraderOrder }> =>
        openOrder(this, order, options)
    public cancelOrder = (orderID: OrderID, options?: TransactionOptions):
        Promise<{ promiEvent: PromiEvent<Transaction> | null }> =>
        cancelOrder(this, orderID, options)

    public fetchDarknodeFeePercent = (): Promise<BigNumber> => darknodeFees(this);
    public fetchWrappingFeePercent = (token: Token): Promise<BigNumber> => wrappingFees(this, token);
    public fetchUnwrappingFeePercent = (token: Token): Promise<BigNumber> => unwrappingFees(this, token);
    public fetchMinEthTradeVolume = (): Promise<BigNumber> => getMinEthTradeVolume(this);
    // public fetchGasPrice = (): Promise<number | undefined> => getGasPrice(this);

    // Provider / account functions
    public getWeb3 = (): Web3 => this._web3;
    public getAddress = (): string => this._address;
    public getConfig = (): Config => this._config;

    public setAddress = (addr: string): void => {
        const address = addr === "" ? "" : new EncodedData(addr, Encodings.HEX).toHex();
        this._address = address;
    }

    public updateProvider = (provider: Provider): void => {
        this._web3 = new Web3(provider);

        // Update contract providers
        this._contracts = {
            renExSettlement: new (withProvider(this.getWeb3().currentProvider, RenExSettlement))(this._networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.getWeb3().currentProvider, RenExBalances))(this._networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.getWeb3().currentProvider, Orderbook))(this._networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(this.getWeb3().currentProvider, DarknodeRegistry))(this._networkData.contracts[0].darknodeRegistry),
            renExTokens: new (withProvider(this.getWeb3().currentProvider, RenExTokens))(this._networkData.contracts[0].renExTokens),
            erc20: new Map<Token, ERC20Contract>(),
            wyre: new (withProvider(this.getWeb3().currentProvider, Wyre))(this._networkData.contracts[0].wyre),
        };
    }
}

export default RenExSDK;
