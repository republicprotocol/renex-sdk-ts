import Web3 from "web3";

import { BN } from "bn.js";
import { Provider } from "web3/types";

import LocalStorage from "./storage/localStorage";

import { DarknodeRegistryContract } from "./contracts/bindings/darknode_registry";
import { ERC20Contract } from "./contracts/bindings/erc20";
import { OrderbookContract } from "./contracts/bindings/orderbook";
import { RenExBalancesContract } from "./contracts/bindings/ren_ex_balances";
import { RenExSettlementContract } from "./contracts/bindings/ren_ex_settlement";
import { RenExTokensContract } from "./contracts/bindings/ren_ex_tokens";
import { WyreContract } from "./contracts/bindings/wyre";

import { DarknodeRegistry, Orderbook, RenExBalances, RenExSettlement, RenExTokens, withProvider, Wyre } from "./contracts/contracts";
import { Config, generateConfig } from "./lib/config";
import { NetworkData } from "./lib/network";
import { atomConnected, atomicAddress, atomicAddresses, atomicBalance, atomicBalances, authorizeAtom, currentAtomConnectionStatus, refreshAtomConnectionStatus, resetAtomConnection, supportedTokens, usableAtomicBalance, usableAtomicBalances } from "./methods/atomicMethods";
import { deposit, getBalanceActionStatus, withdraw } from "./methods/balanceActionMethods";
import { balance, balances, lockedBalance, lockedBalances, nondepositedBalance, nondepositedBalances, tokenDetails, usableBalance } from "./methods/balancesMethods";
import { transfer } from "./methods/generalMethods";
import { cancelOrder, getOrders, openOrder } from "./methods/orderbookMethods";
import { matchDetails, status } from "./methods/settlementMethods";
import { Storage } from "./storage/interface";
import { MemoryStorage } from "./storage/memoryStorage";
import { BalanceAction, GetOrdersFilter, IntInput, MatchDetails, Options, Order, OrderID, OrderInputs, OrderStatus, TokenCode, TokenDetails, TraderOrder, TransactionStatus } from "./types";

export * from "./types";

export enum AtomicConnectionStatus {
    InvalidSwapper = "invalid_swapper",
    NotConnected = "not_connected",
    NotAuthorized = "not_authorized",
    AtomNotAuthorized = "atom_not_authorized",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
}

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
        erc20: Map<number, ERC20Contract>,
        wyre: WyreContract,
    };

    public _cachedTokenDetails: Map<number, Promise<{ addr: string, decimals: IntInput, registered: boolean }>> = new Map();

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
            .set(0, Promise.resolve({ addr: "0x0000000000000000000000000000000000000000", decimals: new BN(8), registered: true }))
            .set(1, Promise.resolve({ addr: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", decimals: new BN(18), registered: true }))
            .set(256, Promise.resolve({ addr: this._networkData.tokens.DGX, decimals: new BN(9), registered: true }))
            .set(257, Promise.resolve({ addr: this._networkData.tokens.TUSD, decimals: new BN(18), registered: true }))
            .set(65536, Promise.resolve({ addr: this._networkData.tokens.REN, decimals: new BN(18), registered: true }))
            .set(65537, Promise.resolve({ addr: this._networkData.tokens.ZRX, decimals: new BN(18), registered: true }))
            .set(65538, Promise.resolve({ addr: this._networkData.tokens.OMG, decimals: new BN(18), registered: true }));

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
            erc20: new Map<number, ERC20Contract>(),
            wyre: new (withProvider(this.web3().currentProvider, Wyre))(networkData.contracts[0].wyre),
        };
    }

    public tokenDetails = (token: number): Promise<TokenDetails> => tokenDetails(this, token);
    public transfer = (addr: string, token: number, value: IntInput): Promise<void> => transfer(this, addr, token, value);
    public nondepositedBalance = (token: number): Promise<BN> => nondepositedBalance(this, token);
    public nondepositedBalances = (tokens: number[]): Promise<BN[]> => nondepositedBalances(this, tokens);
    public balance = (token: number): Promise<BN> => balance(this, token);
    public balances = (tokens: number[]): Promise<BN[]> => balances(this, tokens);
    public lockedBalance = (token: number): Promise<BN> => lockedBalance(this, token);
    public lockedBalances = (tokens: number[]): Promise<BN[]> => lockedBalances(this, tokens);
    public usableBalance = (token: number): Promise<BN> => usableBalance(this, token);
    public getBalanceActionStatus = (txHash: string): Promise<TransactionStatus> => getBalanceActionStatus(this, txHash);
    public deposit = (token: number, value: IntInput): Promise<BalanceAction> => deposit(this, token, value);
    public withdraw = (token: number, value: IntInput, withoutIngressSignature = false): Promise<BalanceAction> =>
        withdraw(this, token, value, withoutIngressSignature)
    public status = (orderID: OrderID): Promise<OrderStatus> => status(this, orderID);
    public matchDetails = (orderID: OrderID): Promise<MatchDetails> => matchDetails(this, orderID);
    public openOrder = (order: OrderInputs): Promise<Order> => openOrder(this, order);
    public cancelOrder = (orderID: OrderID): Promise<void> => cancelOrder(this, orderID);
    public getOrders = (filter: GetOrdersFilter): Promise<Order[]> => getOrders(this, filter);

    // Atomic functions
    public atomConnected = (): boolean => atomConnected(this);
    public currentAtomConnectionStatus = (): AtomicConnectionStatus => currentAtomConnectionStatus(this);
    public refreshAtomConnectionStatus = (): Promise<AtomicConnectionStatus> => refreshAtomConnectionStatus(this);
    public resetAtomConnectionStatus = (): Promise<AtomicConnectionStatus> => resetAtomConnection(this);
    public authorizeAtom = () => authorizeAtom(this);
    public atomicBalance = (token: number): Promise<BN> => atomicBalance(this, token);
    public atomicBalances = (tokens: number[]): Promise<BN[]> => atomicBalances(this, tokens);
    public usableAtomicBalance = (token: number): Promise<BN> => usableAtomicBalance(this, token);
    public usableAtomicBalances = (tokens: number[]): Promise<BN[]> => usableAtomicBalances(this, tokens);
    public atomicAddress = (token: number): Promise<string> => atomicAddress(this, token);
    public atomicAddresses = (tokens: number[]): Promise<string[]> => atomicAddresses(this, tokens);
    public supportedAtomicTokens = (): Promise<TokenCode[]> => supportedTokens(this);

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
            erc20: new Map<number, ERC20Contract>(),
            wyre: new (withProvider(this.web3().currentProvider, Wyre))(this._networkData.contracts[0].wyre),
        };
    }

    public updateAddress = (address: string): void => {
        this._address = address;

        this._storage = new LocalStorage(address);
    }
}

export default RenExSDK;
