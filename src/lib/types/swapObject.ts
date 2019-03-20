/**
 * ReturnedSwap is returned back by the GET /swaps endpoint
 */

import { Token } from "../tokens";

interface CostObject {
    [token: string]: string;
}

//////////// COMMON ////////////////////////////////////////////////////////////

interface SwapCore {
    sendToken: Token;
    receiveToken: Token;
    sendAmount: string;
    receiveAmount: string;
    delay: boolean | undefined;
}

export interface InnerDelayInfo {
    kycAddr: string;
    orderID: string;
    receiveTokenAddr: string;
    sendTokenAddr: string;
}

//////////// RETURNED //////////////////////////////////////////////////////////

export interface ReturnedSwapCore extends SwapCore {
    id: string;
    sendCost: CostObject[];
    receiveCost: CostObject[];
    timestamp: number;
    timeLock: number;
    status: number;
    active: boolean;
}

export interface ReturnedNonDelayedSwap extends ReturnedSwapCore {
    delay: false | undefined;
    delayInfo: undefined;
}

export interface ReturnedDelayedSwap extends ReturnedSwapCore {
    delay: true;
    delayInfo: {
        message: InnerDelayInfo;
        signature: string;
    };
}

export type UnfixedReturnedSwap = ReturnedNonDelayedSwap | ReturnedDelayedSwap;

//////////// SENT //////////////////////////////////////////////////////////////

export interface SentSwapCore extends SwapCore {
    id?: string;
    minimumReceiveFill?: string;
    sendTo?: string;
    receiveFrom?: string;
    timeLock?: number;
    secretHash?: string;
    shouldInitiateFirst?: boolean;
    delayCallbackUrl?: string;
    brokerFee?: number;
    sendFee?: string;
    receiveFee?: string;
    brokerSendTokenAddr?: string;
    brokerReceiveTokenAddr?: string;
}

export interface SentNonDelayedSwap extends SentSwapCore {
    delay: false | undefined;
}

export interface SentDelayedSwap extends SentSwapCore {
    delay: true;
    delayInfo: InnerDelayInfo;
}

export type SentSwap = SentNonDelayedSwap | SentDelayedSwap;

//////////// IMMEDIATE RESPONSE ////////////////////////////////////////////////

export interface SubmitImmediateResponse {
    swap: SentSwap;
    signature: string;
    id: string;
}

export enum SwapStatus {
    INACTIVE = "inactive",
    INITIATED = "initiated",
    AUDITED = "audited",
    AUDIT_PENDING = "audit_pending",
    AUDIT_FAILED = "audit_failed",
    REDEEMED = "redeemed",
    AUDITED_SECRET = "audited_secret",
    REFUNDED = "refunded",
    REFUND_FAILED = "refund_failed",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
}

/**
 * This replaces the InnerReturnedSwap status from type number to type SwapStatus
 */
export interface ReturnedSwap extends Pick<UnfixedReturnedSwap,
    Exclude<keyof UnfixedReturnedSwap, "status">> {
    status: SwapStatus;
}
