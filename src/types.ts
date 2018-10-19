import BigNumber from "bignumber.js";

import { BN } from "bn.js";

export { NetworkData } from "./lib/network";

export type NumberInput = number | string | BigNumber;

// tslint:disable-next-line:no-any
export interface Transaction { receipt: any; tx: string; logs: any[]; }

export type OrderID = string;
export enum OrderStatus {
    NOT_SUBMITTED = "NOT_SUBMITTED",
    FAILED_TO_OPEN = "FAILED_TO_OPEN",
    OPEN = "OPEN",
    CONFIRMED = "CONFIRMED",
    CANCELED = "CANCELED",
    SETTLED = "SETTLED",
    SLASHED = "SLASHED",
    EXPIRED = "EXPIRED",
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

export enum OrderSide {
    BUY = "buy",
    SELL = "sell",
}

export enum Token {
    BTC = "BTC",
    ETH = "ETH",
    DGX = "DGX",
    TUSD = "TUSD",
    REN = "REN",
    ZRX = "ZRX",
    OMG = "OMG",
}

export type TokenCode = string;

export interface OrderInputs {
    // Required fields
    baseToken: TokenCode;    // The non-priority token
    quoteToken: TokenCode;   // The priority token
    side: OrderSide;         // Buy receives baseToken, sell receives quoteToken
    price: NumberInput;      // In quoteToken for 1 unit of baseToken
    volume: NumberInput;     // In baseToken

    // Optional fields
    minVolume?: OrderInputsAll["minVolume"];  // In baseToken
    type?: OrderInputsAll["type"];
    orderSettlement?: OrderInputsAll["orderSettlement"];
    nonce?: OrderInputsAll["nonce"];
    expiry?: OrderInputsAll["expiry"];
}

// OrderInputsAll extends OrderInputs and sets optional fields to be required.
export interface OrderInputsAll extends OrderInputs {
    // Restrict type
    price: BigNumber;
    volume: BigNumber;
    minVolume: BigNumber;

    // Change to non-optional
    type: OrderType;
    orderSettlement: OrderSettlement;
    nonce: BN;
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
}

export interface Order {
    readonly id: OrderID;
    readonly trader: string;
    status: OrderStatus;
    matchDetails?: MatchDetails;
}

// If TraderOrder is changed, then it's serialize / deserialize functions should
// be updated as well.
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
    free: BigNumber;
    used: BigNumber;
    nondeposited: BigNumber;
}

export interface AtomicBalanceDetails {
    free: BigNumber;
    used: BigNumber;
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

// If BalanceAction is changed, then it's serialize / deserialize functions
// should be updated as well.
export interface BalanceAction {
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
    minTradeVolume?: NumberInput;
}

export interface SimpleConsole {
    error(message?: string): void;
    log(message?: string): void;
}

export const NullConsole: SimpleConsole = {
    error: (message) => null,
    log: (message) => null,
};

export enum AtomicConnectionStatus {
    InvalidSwapper = "invalid_swapper",
    ChangedSwapper = "changed_swapper",
    NotConnected = "not_connected",
    NotAuthorized = "not_authorized",
    AtomNotAuthorized = "atom_not_authorized",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
}
