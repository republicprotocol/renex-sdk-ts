import Web3 from "web3";
import { BN } from "bn.js";
import { PromiEvent, Provider } from "web3/types";
import { Config } from "./lib/config";
import { NetworkData } from "./lib/network";
import { Storage } from "./storage/interface";
import { AtomicConnectionStatus, BalanceAction, GetOrdersFilter, IntInput, MatchDetails, Options, Order, OrderInputs, OrderStatus, SimpleConsole, TokenDetails, TraderOrder, Transaction, TransactionStatus } from "./types";
import { DarknodeRegistryContract } from "./contracts/bindings/darknode_registry";
import { ERC20Contract } from "./contracts/bindings/erc20";
import { OrderbookContract } from "./contracts/bindings/orderbook";
import { RenExBalancesContract } from "./contracts/bindings/ren_ex_balances";
import { RenExSettlementContract } from "./contracts/bindings/ren_ex_settlement";
import { RenExTokensContract } from "./contracts/bindings/ren_ex_tokens";
import { WyreContract } from "./contracts/bindings/wyre";
export * from "./types";
/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class RenExSDK
 */
declare class RenExSDK {
    _networkData: NetworkData;
    _atomConnectionStatus: AtomicConnectionStatus;
    _atomConnectedAddress: string;
    _storage: Storage;
    _contracts: {
        renExSettlement: RenExSettlementContract;
        renExTokens: RenExTokensContract;
        renExBalances: RenExBalancesContract;
        orderbook: OrderbookContract;
        darknodeRegistry: DarknodeRegistryContract;
        erc20: Map<number, ERC20Contract>;
        wyre: WyreContract;
    };
    _cachedTokenDetails: Map<number, Promise<{
        addr: string;
        decimals: IntInput;
        registered: boolean;
    }>>;
    private _web3;
    private _address;
    private _config;
    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, networkData: NetworkData, address: string, options?: Options);
    tokenDetails: (token: number) => Promise<TokenDetails>;
    transfer: (addr: string, token: number, value: IntInput) => Promise<void>;
    nondepositedBalance: (token: number) => Promise<BN>;
    nondepositedBalances: (tokens: number[]) => Promise<BN[]>;
    balance: (token: number) => Promise<BN>;
    balances: (tokens: number[]) => Promise<BN[]>;
    lockedBalance: (token: number) => Promise<BN>;
    lockedBalances: (tokens: number[]) => Promise<BN[]>;
    usableBalance: (token: number) => Promise<BN>;
    getBalanceActionStatus: (txHash: string) => Promise<TransactionStatus>;
    status: (orderID: string) => Promise<OrderStatus>;
    matchDetails: (orderID: string) => Promise<MatchDetails>;
    getOrders: (filter: GetOrdersFilter) => Promise<Order[]>;
    getOrderBlockNumber: (orderID: string) => Promise<number>;
    deposit: (token: number, value: IntInput) => Promise<{
        balanceAction: BalanceAction;
        promiEvent: PromiEvent<Transaction> | null;
    }>;
    withdraw: (token: number, value: IntInput, withoutIngressSignature?: boolean) => Promise<{
        balanceAction: BalanceAction;
        promiEvent: PromiEvent<Transaction> | null;
    }>;
    openOrder: (order: OrderInputs, simpleConsole?: SimpleConsole | undefined) => Promise<{
        traderOrder: TraderOrder;
        promiEvent: PromiEvent<Transaction> | null;
    }>;
    cancelOrder: (orderID: string) => Promise<{
        promiEvent: PromiEvent<Transaction> | null;
    }>;
    orderFeeDenominator: () => Promise<BN>;
    orderFeeNumerator: () => Promise<BN>;
    getGasPrice: () => Promise<number | undefined>;
    atomConnected: () => boolean;
    currentAtomConnectionStatus: () => AtomicConnectionStatus;
    refreshAtomConnectionStatus: () => Promise<AtomicConnectionStatus>;
    resetAtomConnectionStatus: () => Promise<AtomicConnectionStatus>;
    authorizeAtom: () => Promise<AtomicConnectionStatus>;
    atomicBalance: (token: number) => Promise<BN>;
    atomicBalances: (tokens: number[]) => Promise<BN[]>;
    usableAtomicBalance: (token: number) => Promise<BN>;
    usableAtomicBalances: (tokens: number[]) => Promise<BN[]>;
    atomicAddress: (token: number) => Promise<string>;
    atomicAddresses: (tokens: number[]) => Promise<string[]>;
    supportedAtomicTokens: () => Promise<number[]>;
    listTraderOrders: () => Promise<TraderOrder[]>;
    listBalanceActions: () => Promise<BalanceAction[]>;
    web3: () => Web3;
    address: () => string;
    config: () => Config;
    updateProvider: (provider: Provider) => void;
    updateAddress: (address: string) => void;
}
export default RenExSDK;
