import BigNumber from "bignumber.js";
import { BN } from "bn.js";
export { NetworkData } from "./lib/network";
export declare type IntInput = number | string | BN;
export declare type FloatInput = number | string | BigNumber;
export interface Transaction {
    receipt: any;
    tx: string;
    logs: any[];
}
export declare type OrderID = string;
export declare enum OrderStatus {
    NOT_SUBMITTED = "NOT_SUBMITTED",
    FAILED_TO_SETTLE = "FAILED_TO_SETTLE",
    OPEN = "OPEN",
    CONFIRMED = "CONFIRMED",
    CANCELED = "CANCELED",
    SETTLED = "SETTLED",
    SLASHED = "SLASHED",
    EXPIRED = "EXPIRED"
}
export declare enum OrderSettlement {
    RenEx = 1,
    RenExAtomic = 2
}
export declare enum OrderType {
    MIDPOINT = 0,
    LIMIT = 1,
    MIDPOINT_IOC = 2,
    LIMIT_IOC = 3
}
export declare enum OrderParity {
    BUY = 0,
    SELL = 1
}
export declare type TokenCode = number;
export interface OrderInputs {
    spendToken: TokenCode;
    receiveToken: TokenCode;
    price: FloatInput;
    volume: IntInput;
    minimumVolume: IntInput;
    type?: OrderInputsAll["type"];
    orderSettlement?: OrderInputsAll["orderSettlement"];
    nonce?: OrderInputsAll["nonce"];
    expiry?: OrderInputsAll["expiry"];
}
export interface OrderInputsAll extends OrderInputs {
    price: BigNumber;
    volume: BN;
    minimumVolume: BN;
    type: OrderType;
    orderSettlement: OrderSettlement;
    nonce: BN;
    expiry: number;
}
export interface ComputedOrderDetails {
    receiveVolume: BN;
    spendVolume: BN;
    date: number;
    parity: OrderParity;
    feeAmount: BN;
    feeToken: TokenCode;
}
export interface Order {
    readonly id: OrderID;
    readonly trader: string;
    status: OrderStatus;
    matchDetails?: MatchDetails;
}
export interface TraderOrder extends Order {
    readonly computedOrderDetails: ComputedOrderDetails;
    readonly orderInputs: OrderInputsAll;
    readonly transactionHash: string;
}
export interface GetOrdersFilter {
    address?: string;
    status?: OrderStatus;
    limit?: number;
    start?: number;
}
export interface MatchDetails {
    orderID: string;
    matchedID: string;
    receivedVolume: BN;
    spentVolume: BN;
    fee: BN;
    receivedToken: TokenCode;
    spentToken: TokenCode;
}
export interface TokenDetails {
    address: string;
    decimals: number;
    registered: boolean;
}
export declare enum BalanceActionType {
    Withdraw = "withdraw",
    Deposit = "deposit"
}
export declare enum TransactionStatus {
    Pending = "pending",
    Done = "done",
    Failed = "failed",
    Replaced = "replaced"
}
export interface BalanceAction {
    action: BalanceActionType;
    amount: BN;
    time: number;
    status: TransactionStatus;
    token: TokenCode;
    trader: string;
    txHash: string;
    nonce: number | undefined;
}
export interface Options {
    minimumTradeVolume?: IntInput;
}
export interface SimpleConsole {
    error(message?: string): void;
    log(message?: string): void;
}
export declare const NullConsole: SimpleConsole;
export declare enum AtomicConnectionStatus {
    InvalidSwapper = "invalid_swapper",
    ChangedSwapper = "changed_swapper",
    NotConnected = "not_connected",
    NotAuthorized = "not_authorized",
    AtomNotAuthorized = "atom_not_authorized",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked"
}
