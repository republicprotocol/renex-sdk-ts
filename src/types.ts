import BigNumber from "bignumber.js";
import { MarketPair, Token } from "lib/tokens";

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

export type OrderSide = "buy" | "sell";
export const OrderSide = {
    BUY: "buy" as OrderSide,
    SELL: "sell" as OrderSide,
};

export interface MarketDetails {
    symbol: MarketPair;
    quote: Token;
    base: Token;
}

export interface OrderInputs {
    sendToken: Token;
    receiveToken: Token;

    sendVolume?: NumberInput;
    receiveVolume?: NumberInput;
    price?: NumberInput;

    minQuoteVolume?: NumberInput;

    allOrNothing?: boolean;
    immediateOrCancel?: boolean;
}

// OrderInputsAll extends OrderInputs and sets optional fields to be required.
export interface OrderInputsAll extends OrderInputs {
    receiveVolume: BigNumber;
    sendVolume: BigNumber;
    price: BigNumber;

    minQuoteVolume: BigNumber;
    minBaseVolume: BigNumber;

    // Double ups
    minReceiveVolume: BigNumber;
    minSendVolume: BigNumber;
    quoteToken: Token;
    quoteVolume: BigNumber;
    baseToken: Token;
    baseVolume: BigNumber;

    side: OrderSide;
    marketPair: MarketPair;
    marketDetails: MarketDetails;
}

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
    name: string;
    symbol: Token;
    decimals: number;
    priority: number;
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
