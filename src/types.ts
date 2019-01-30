import BigNumber from "bignumber.js";

import BN from "bn.js";
import { StorageProvider } from "./storage/interface";

export { NetworkData } from "./lib/network";

export type NumberInput = number | string | BigNumber;

// tslint:disable-next-line:no-any
export interface Transaction { receipt: any; tx: string; logs: any[]; }

export type OrderID = string;
export enum OrderStatus {
    NOT_SUBMITTED = "NOT_SUBMITTED",
    FAILED_TO_SETTLE = "FAILED_TO_SETTLE",
    OPEN = "OPEN",
    CONFIRMED = "CONFIRMED",
    CANCELED = "CANCELED",
    SETTLED = "SETTLED",
    SLASHED = "SLASHED",
    EXPIRED = "EXPIRED",
}

export enum OrderSettlement {
    RenEx = "renex",
    RenExAtomic = "atomic",
}

export enum OrderType {
    MIDPOINT = "midpoint", // FIXME: Unsupported
    LIMIT = "limit",
    MIDPOINT_IOC = "midpoint_ioc", // FIXME: Unsupported
    LIMIT_IOC = "limit_ioc",
}

export type OrderSide = "buy" | "sell";
export const OrderSide = {
    BUY: "buy" as OrderSide,
    SELL: "sell" as OrderSide,
};

export enum Token {
    BTC = "BTC",
    ETH = "ETH",
    DGX = "DGX",
    TUSD = "TUSD",
    REN = "REN",
    ZRX = "ZRX",
    OMG = "OMG",
    WBTC = "WBTC",
}

export enum MarketPair {
    WBTC_BTC = "WBTC/BTC",
    ETH_BTC = "ETH/BTC",
    REN_BTC = "REN/BTC",
    TUSD_BTC = "TUSD/BTC",
    DGX_ETH = "DGX/ETH",
    TUSD_ETH = "TUSD/ETH",
    REN_ETH = "REN/ETH",
    ZRX_ETH = "ZRX/ETH",
    OMG_ETH = "OMG/ETH",
}

export interface MarketDetails {
    symbol: MarketCode;
    orderSettlement: OrderSettlement;
    quote: TokenCode;
    base: TokenCode;
}

export type TokenCode = string;
export type MarketCode = string;

export interface OrderInputs {
    // Required fields
    symbol: MarketCode;      // The trading pair symbol e.g. "ETH/BTC" in base token / quote token
    side: OrderSide;            // Buy receives base token, sell receives quote token
    price: NumberInput;      // In quoteToken for 1 unit of baseToken
    volume: NumberInput;     // In baseToken

    // Optional fields
    minVolume?: NumberInput; // In baseToken
    type?: OrderInputsAll["type"];
}

// OrderInputsAll extends OrderInputs and sets optional fields to be required.
export interface OrderInputsAll extends OrderInputs {
    // Restrict type
    price: BigNumber;
    volume: BigNumber;
    side: OrderSide;

    // Change to non-optional
    minVolume: BigNumber;
    type: OrderType;
    // This may have been set in the past but now defaults to zero
    expiry: number;
}

export interface ComputedOrderDetails {
    receiveToken: TokenCode;
    spendToken: TokenCode;
    receiveVolume: BigNumber;
    spendVolume: BigNumber;
    date: number;
    feeAmount: BigNumber;
    feeToken: TokenCode;
    orderSettlement: OrderSettlement;
    nonce: BN;
}

export interface Order {
    readonly id: OrderID;
    readonly trader: string;
    status: OrderStatus;
    matchDetails?: MatchDetails;
}

export interface WBTCOrder extends Order {
    readonly version?: number;
    readonly swapServer: true;
    readonly orderInputs: OrderInputs;
    readonly computedOrderDetails: ComputedOrderDetails;
}

export interface SwapOrder extends Order {
    // Some older versions of TraderOrder do not have version
    readonly version?: number;

    readonly swapServer: undefined;

    readonly computedOrderDetails: ComputedOrderDetails;
    readonly orderInputs: OrderInputsAll;
    readonly transactionHash: string;
}

// If TraderOrder is changed, then it's serialize / deserialize functions should
// be updated as well.
export type TraderOrder = WBTCOrder | SwapOrder;

export interface OrderbookFilter {
    address?: string;
    status?: OrderStatus;
    limit?: number;
    start?: number;
}

export interface MatchDetails {
    orderID: string;
    matchedID: string;

    receivedVolume: BigNumber;
    spentVolume: BigNumber;
    fee: BigNumber;
    receivedToken: TokenCode;
    spentToken: TokenCode;
}

export interface TokenDetails {
    address: string;
    decimals: number;
    registered: boolean;
}

export interface BalanceDetails {
    free: BigNumber | null;
    used: BigNumber | null;
    nondeposited: BigNumber | null;
}

export interface SwapperdBalanceDetails {
    free: BigNumber | null;
    used: BigNumber | null;
}

export enum BalanceActionType {
    Withdraw = "withdraw",
    Deposit = "deposit",
}

export enum TransactionStatus {
    Pending = "pending",
    Done = "done",
    Failed = "failed",
    Replaced = "replaced",
}

export interface TransactionOptions {
    awaitConfirmation?: boolean;
    gasPrice?: number | undefined;
    simpleConsole?: SimpleConsole;
}

export interface WithdrawTransactionOptions extends TransactionOptions {
    withoutIngressSignature?: boolean;
}

// If BalanceAction is changed, then it's serialize / deserialize functions
// should be updated as well.
export interface BalanceAction {
    // Some older versions of BalanceAction do not have version
    version?: number;
    action: BalanceActionType;
    amount: BigNumber;
    time: number;
    status: TransactionStatus;
    token: TokenCode;
    trader: string;
    txHash: string;
    nonce: number | undefined;
}

export interface Options {
    network?: Config["network"];
    autoNormalizeOrders?: Config["autoNormalizeOrders"];
    storageProvider?: Config["storageProvider"];
}

// Extends Options but makes the optional parameters concrete
export interface Config extends Options {
    network: string;
    autoNormalizeOrders: boolean;
    storageProvider: string | StorageProvider;
}

export interface SimpleConsole {
    error(message?: string): void;
    log(message?: string): void;
}

export const NullConsole: SimpleConsole = {
    error: (message) => null,
    log: (message) => null,
};

export enum SwapperdConnectionStatus {
    InvalidSwapper = "invalid_swapper",
    ChangedSwapper = "changed_swapper",
    NotConnected = "not_connected",
    NotAuthorized = "not_authorized",
    SwapperdNotAuthorized = "swapperd_not_authorized",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
}
