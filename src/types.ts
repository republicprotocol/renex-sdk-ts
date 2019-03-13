import BigNumber from "bignumber.js";

import BN from "bn.js";

export { NetworkData } from "./lib/network";

export type NumberInput = number | string | BigNumber;

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
    DAI = "DAI",
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
    DAI_ETH = "DAI/ETH",
    REN_ETH = "REN/ETH",
    ZRX_ETH = "ZRX/ETH",
    OMG_ETH = "OMG/ETH",
}

export interface MarketDetails {
    symbol: MarketPair;
    quote: Token;
    base: Token;
}

export interface OrderInputs {
    // Required fields
    symbol: MarketPair;            // The trading pair symbol e.g. "ETH/BTC" in base token / quote token
    side: OrderSide;               // Buy receives base token, sell receives quote token
    price: NumberInput;            // In quoteToken for 1 unit of baseToken
    volume: NumberInput;           // In baseToken
    priorityVolume?: NumberInput;   // In quoteToken

    // Optional fields
    minVolume?: NumberInput;       // In baseToken
    type?: OrderInputsAll["type"]; // OrderType
}

// OrderInputsAll extends OrderInputs and sets optional fields to be required.
export interface OrderInputsAll extends OrderInputs {
    // Restrict type
    price: BigNumber;
    volume: BigNumber;
    priorityVolume: BigNumber;
    side: OrderSide;

    // Change to non-optional
    minVolume: BigNumber;
    type: OrderType;
    // This may have been set in the past but now defaults to zero
    expiry: number;
}

export interface ComputedOrderDetails {
    receiveToken: Token;
    spendToken: Token;
    receiveVolume: BigNumber;
    spendVolume: BigNumber;
    date: number;
    feeAmount: BigNumber;
    feeToken: Token;
    nonce: BN;
}

interface Order {
    readonly id: OrderID;
    readonly trader: string;
    status: OrderStatus;
    matchDetails?: MatchDetails;
}

export interface WBTCOrder extends Order {
    readonly swapServer: true;
    readonly orderInputs: OrderInputs;
    readonly computedOrderDetails: ComputedOrderDetails;
}

export interface SwapOrder extends Order {
    readonly swapServer: undefined;

    readonly computedOrderDetails: ComputedOrderDetails;
    readonly orderInputs: OrderInputsAll;
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
    receivedToken: Token;
    spentToken: Token;
}

export interface TokenDetails {
    address: string;
    decimals: number;
}

export interface BalanceDetails {
    free: BigNumber | null;
    used: BigNumber | null;
    nondeposited: BigNumber | null;
}

export interface SwapperDBalanceDetails {
    free: BigNumber | null;
    used: BigNumber | null;
}

export interface TransactionOptions {
    simpleConsole?: SimpleConsole;
}

export interface Options {
    network?: Config["network"];
    autoNormalizeOrders?: Config["autoNormalizeOrders"];
}

// Extends Options but makes the optional parameters concrete
export interface Config extends Options {
    network: string;
    autoNormalizeOrders: boolean;
}

export interface SimpleConsole {
    error(message?: string): void;
    log(message?: string): void;
}

export const NullConsole: SimpleConsole = {
    error: (_message) => null,
    log: (_message) => null,
};

export enum SwapperDConnectionStatus {
    InvalidSwapper = "invalid_swapper",
    ChangedSwapper = "changed_swapper",
    NotConnected = "not_connected",
    // NotAuthorized = "not_authorized",
    SwapperDNotAuthorized = "swapperD_not_authorized",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
}
