import BigNumber from "bignumber.js";

import { BN } from "bn.js";
import { AtomicSwapStatus } from "./lib/atomic";

export { AtomicConnectionStatus, AtomicSwapStatus } from "./lib/atomic";
export { NetworkData } from "./lib/network";

// These are temporary types to ensure that all user inputs are converted
// correctly.
export type IntInput = number | string | BN;
export type FloatInput = number | string | BigNumber;

export interface Transaction { receipt: any; tx: string; logs: any[]; }

export type OrderID = string;
export enum OrderStatus {
    NOT_SUBMITTED = "not submitted",
    FAILED_TO_OPEN = "failed to open",
    OPEN = "open",
    CONFIRMED = "confirmed",
    CANCELED = "canceled",
    SETTLED = "settled",
    SLASHED = "slashed",
    EXPIRED = "expired",
}

export enum OrderSettlement {
    RenEx = 1,
    RenExAtomic = 2,
}

export enum OrderType {
    MIDPOINT = 0, // FIXME: Unsupported
    LIMIT = 1,
    MIDPOINT_IOC = 2, // FIXME: Unsupported
    LIMIT_IOC = 3,
}

export enum OrderParity {
    BUY = 0,
    SELL = 1,
}

export type TokenCode = number;

export interface OrderInputs {
    // Required fields
    spendToken: TokenCode;
    receiveToken: TokenCode;
    price: FloatInput;
    volume: IntInput;
    minimumVolume: IntInput;

    // Optional fields
    type?: OrderInputsAll["type"];
    orderSettlement?: OrderInputsAll["orderSettlement"];
    nonce?: OrderInputsAll["nonce"];
    expiry?: OrderInputsAll["expiry"];
}

// OrderInputsAll extends OrderInputs and sets optional fields to be required.
export interface OrderInputsAll extends OrderInputs {
    // Restrict type
    price: BigNumber;
    volume: BN;
    minimumVolume: BN;

    // Change to non-optional
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
}

export interface Order {
    readonly id: OrderID;
    readonly trader: string;
    status: OrderStatus;
    atomicSwapStatus?: AtomicSwapStatus;
    matchDetails?: MatchDetails;
}

// If TraderOrder, then it's serialize / deserialize functions should be
// updated as well.
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

export enum BalanceActionType {
    Withdraw = "withdraw",
    Deposit = "deposit",
}

export enum TransactionStatus {
    Pending = "pending",
    Done = "done",
    Failed = "failed"
}

// If BalanceAction, then it's serialize / deserialize functions should be
// updated as well.
export interface BalanceAction {
    action: BalanceActionType;
    amount: BN;
    time: number;
    status: TransactionStatus;
    token: TokenCode;
    trader: string;
    txHash: string;
}
