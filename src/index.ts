import BigNumber from "bignumber.js";
import Web3 from "web3";

import { BN } from "bn.js";

import { PromiEvent, Provider } from "web3/types";

import LocalStorage from "./storage/localStorage";

import { DarknodeRegistry, Orderbook, RenExBalances, RenExSettlement, RenExTokens, withProvider, Wyre } from "./contracts/contracts";
import { Config, generateConfig } from "./lib/config";
import { normalizePrice, normalizeVolume } from "./lib/conversion";
import { NetworkData } from "./lib/network";
import { supportedTokens } from "./lib/tokens";
import { atomConnected, atomicAddresses, atomicBalances, authorizeAtom, currentAtomConnectionStatus, refreshAtomConnectionStatus, resetAtomConnection, supportedAtomicTokens } from "./methods/atomicMethods";
import { deposit, getBalanceActionStatus, withdraw } from "./methods/balanceActionMethods";
import { balances } from "./methods/balancesMethods";
import { getGasPrice } from "./methods/generalMethods";
import { cancelOrder, getMinEthTradeVolume, getOrders, openOrder } from "./methods/orderbookMethods";
import { darknodeFees, matchDetails, status } from "./methods/settlementMethods";
import { Storage } from "./storage/interface";
import { MemoryStorage } from "./storage/memoryStorage";
import { AtomicBalanceDetails, AtomicConnectionStatus, BalanceAction, BalanceDetails, GetOrdersFilter, MatchDetails, NumberInput, Options, Order, OrderID, OrderInputs, OrderStatus, SimpleConsole, Token, TokenCode, TokenDetails, TraderOrder, Transaction, TransactionStatus } from "./types";

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

/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class RenExSDK
 */
class RenExSDK {

    public _networkData: NetworkData;
    public _atomConnectionStatus: AtomicConnectionStatus = AtomicConnectionStatus.NotConnected;
    public _atomConnectedAddress: string = "";

    public _storage: Storage;
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
        connected: (): boolean => atomConnected(this),
        status: (): AtomicConnectionStatus => currentAtomConnectionStatus(this),
        refreshStatus: (): Promise<AtomicConnectionStatus> => refreshAtomConnectionStatus(this),
        resetStatus: (): Promise<AtomicConnectionStatus> => resetAtomConnection(this),
        authorize: (): Promise<AtomicConnectionStatus> => authorizeAtom(this),
        balances: (tokens: TokenCode[]): Promise<Map<TokenCode, AtomicBalanceDetails>> => atomicBalances(this, tokens),
        addresses: (tokens: TokenCode[]): Promise<string[]> => atomicAddresses(tokens),
    };

    public utils = {
        normalizePrice: (price: BigNumber, roundUp?: boolean): BigNumber => normalizePrice(price, roundUp),
        normalizeVolume: (volume: BigNumber, roundUp?: boolean): BigNumber => normalizeVolume(volume, roundUp),
    };

    private _web3: Web3;
    private _address: string;
    private _config: Config;

    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, networkData: NetworkData, address: string, options?: Options) {
        this._web3 = new Web3(provider);
        this._networkData = networkData;
        this._address = address;
        this._config = generateConfig(options);

        this._cachedTokenDetails = this._cachedTokenDetails
            .set(Token.BTC, Promise.resolve({ addr: "0x0000000000000000000000000000000000000000", decimals: new BN(8), registered: true }))
            .set(Token.ETH, Promise.resolve({ addr: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: new BN(18), registered: true }))
            .set(Token.DGX, Promise.resolve({ addr: this._networkData.tokens.DGX, decimals: new BN(9), registered: true }))
            .set(Token.TUSD, Promise.resolve({ addr: this._networkData.tokens.TUSD, decimals: new BN(18), registered: true }))
            .set(Token.REN, Promise.resolve({ addr: this._networkData.tokens.REN, decimals: new BN(18), registered: true }))
            .set(Token.ZRX, Promise.resolve({ addr: this._networkData.tokens.ZRX, decimals: new BN(18), registered: true }))
            .set(Token.OMG, Promise.resolve({ addr: this._networkData.tokens.OMG, decimals: new BN(18), registered: true }));

        if (address) {
            this._storage = new LocalStorage(address);
        } else {
            this._storage = new MemoryStorage();
        }

        this._contracts = {
            renExSettlement: new (withProvider(this.web3().currentProvider, RenExSettlement))(networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.web3().currentProvider, RenExBalances))(networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.web3().currentProvider, Orderbook))(networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(this.web3().currentProvider, DarknodeRegistry))(networkData.contracts[0].darknodeRegistry),
            renExTokens: new (withProvider(this.web3().currentProvider, RenExTokens))(networkData.contracts[0].renExTokens),
            erc20: new Map<TokenCode, ERC20Contract>(),
            wyre: new (withProvider(this.web3().currentProvider, Wyre))(networkData.contracts[0].wyre),
        };
    }

    public balances = (tokens: TokenCode[]): Promise<Map<TokenCode, BalanceDetails>> => balances(this, tokens);
    public getBalanceActionStatus = (txHash: string): Promise<TransactionStatus> => getBalanceActionStatus(this, txHash);
    public status = (orderID: OrderID): Promise<OrderStatus> => status(this, orderID);
    public matchDetails = (orderID: OrderID): Promise<MatchDetails> => matchDetails(this, orderID);
    public getOrders = (filter: GetOrdersFilter): Promise<Order[]> => getOrders(this, filter);
    public supportedTokens = (): Promise<TokenCode[]> => supportedTokens(this);
    public supportedAtomicTokens = (): Promise<TokenCode[]> => supportedAtomicTokens(this);

    // Transaction Methods
    public deposit = (token: TokenCode, value: NumberInput):
        Promise<{ balanceAction: BalanceAction, promiEvent: PromiEvent<Transaction> | null }> =>
        deposit(this, token, value)
    public withdraw = (token: TokenCode, value: NumberInput, withoutIngressSignature = false):
        Promise<{ balanceAction: BalanceAction, promiEvent: PromiEvent<Transaction> | null }> =>
        withdraw(this, token, value, withoutIngressSignature)
    public openOrder = (order: OrderInputs, simpleConsole?: SimpleConsole):
        Promise<{ traderOrder: TraderOrder, promiEvent: PromiEvent<Transaction> | null }> =>
        openOrder(this, order, simpleConsole)
    public cancelOrder = (orderID: OrderID):
        Promise<{ promiEvent: PromiEvent<Transaction> | null }> =>
        cancelOrder(this, orderID)

    public darknodeFees = (): Promise<BigNumber> => darknodeFees(this);
    public minEthTradeVolume = (): Promise<BigNumber> => getMinEthTradeVolume(this);

    public getGasPrice = (): Promise<number | undefined> => getGasPrice(this);

    // Storage functions
    public listTraderOrders = async (): Promise<TraderOrder[]> =>
        this._storage
            .getOrders()
            .then(orders => orders.sort((a, b) => a.computedOrderDetails.date < b.computedOrderDetails.date ? -1 : 1))

    public listBalanceActions = (): Promise<BalanceAction[]> =>
        this._storage
            .getBalanceActions()
            .then(actions => actions.sort((a, b) => a.time < b.time ? -1 : 1))

    // Provider / account functions
    public web3 = (): Web3 => this._web3;
    public address = (): string => this._address;
    public config = (): Config => this._config;

    public updateProvider = (provider: Provider): void => {
        this._web3 = new Web3(provider);

        // Update contract providers
        this._contracts = {
            renExSettlement: new (withProvider(this.web3().currentProvider, RenExSettlement))(this._networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.web3().currentProvider, RenExBalances))(this._networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.web3().currentProvider, Orderbook))(this._networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(this.web3().currentProvider, DarknodeRegistry))(this._networkData.contracts[0].darknodeRegistry),
            renExTokens: new (withProvider(this.web3().currentProvider, RenExTokens))(this._networkData.contracts[0].renExTokens),
            erc20: new Map<TokenCode, ERC20Contract>(),
            wyre: new (withProvider(this.web3().currentProvider, Wyre))(this._networkData.contracts[0].wyre),
        };
    }

    public updateAddress = (address: string): void => {
        this._address = address;

        this._storage = new LocalStorage(address);
    }
}

export default RenExSDK;
