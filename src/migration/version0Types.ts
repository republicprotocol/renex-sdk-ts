import BigNumber from "bignumber.js";
import BN from "bn.js";

import { OrderSettlement, OrderSide, OrderType, Token, TokenCode } from "../types";

interface ComputedOrderDetails {
    receiveVolume: BN;
    spendVolume: BN;
    date: number;
    parity: V0OrderParity;
    feeAmount: BN;
    feeToken: number;
}

interface V0MatchDetails {
    orderID: string;
    matchedID: string;

    receivedVolume: BN;
    spentVolume: BN;
    fee: BN;
    receivedToken: number;
    spentToken: number;
}

enum V0OrderStatus {
    NOT_SUBMITTED = "NOT_SUBMITTED",
    FAILED_TO_SETTLE = "FAILED_TO_SETTLE",
    OPEN = "OPEN",
    CONFIRMED = "CONFIRMED",
    CANCELED = "CANCELED",
    SETTLED = "SETTLED",
    SLASHED = "SLASHED",
    EXPIRED = "EXPIRED",
}

interface Order {
    readonly id: string;
    readonly trader: string;
    status: V0OrderStatus;
    matchDetails?: V0MatchDetails;
}

interface OrderInputs {
    // Required fields
    spendToken: number;
    receiveToken: number;
    price: number | string | BigNumber;
    volume: number | string | BN;
    minimumVolume: number | string | BN;

    // Optional fields
    type?: OrderInputsAll["type"];
    orderSettlement?: OrderInputsAll["orderSettlement"];
    nonce?: OrderInputsAll["nonce"];
}

enum V0OrderParity {
    BUY = 0,
    SELL = 1,
}

enum V0OrderType {
    MIDPOINT = 0, // FIXME: Unsupported
    LIMIT = 1,
    MIDPOINT_IOC = 2, // FIXME: Unsupported
    LIMIT_IOC = 3,
}

enum V0OrderSettlement {
    RenEx = 1,
    RenExAtomic = 2,
}

interface OrderInputsAll extends OrderInputs {
    // Restrict type
    price: BigNumber;
    volume: BN;
    minimumVolume: BN;

    // Change to non-optional
    type: V0OrderType;
    orderSettlement: V0OrderSettlement;
    nonce: BN;
    // This may have been set in the past but now defaults to zero
    expiry: number;
}

export interface V0TraderOrder extends Order {
    readonly computedOrderDetails: ComputedOrderDetails;
    readonly orderInputs: OrderInputsAll;
    readonly transactionHash: string;
}

export const deserializeV0TraderOrder = (orderString: string): V0TraderOrder => {
    const order: V0TraderOrder = JSON.parse(orderString);

    if (order.matchDetails) {
        order.matchDetails.fee = new BN(order.matchDetails.fee, "hex");
        order.matchDetails.receivedVolume = new BN(order.matchDetails.receivedVolume, "hex");
        order.matchDetails.spentVolume = new BN(order.matchDetails.spentVolume, "hex");
    }

    order.computedOrderDetails.receiveVolume = new BN(order.computedOrderDetails.receiveVolume, "hex");
    order.computedOrderDetails.spendVolume = new BN(order.computedOrderDetails.spendVolume, "hex");
    order.computedOrderDetails.feeAmount = new BN(order.computedOrderDetails.feeAmount, "hex");

    order.orderInputs.minimumVolume = new BN(order.orderInputs.minimumVolume, "hex");
    order.orderInputs.nonce = new BN(order.orderInputs.nonce, "hex");
    order.orderInputs.price = new BigNumber(order.orderInputs.price);
    order.orderInputs.volume = new BN(order.orderInputs.volume, "hex");

    return order;
};

export function idToToken(token: number): TokenCode {
    switch (token) {
        case 0:
            return Token.BTC;
        case 1:
            return Token.ETH;
        case 256:
            return Token.DGX;
        case 257:
            return Token.TUSD;
        case 65536:
            return Token.REN;
        case 65537:
            return Token.ZRX;
        case 65538:
            return Token.OMG;
        default:
            throw new Error(`Invalid token ID: ${token}`);
    }
}

export function OrderSettlementMapper(settlement: V0OrderSettlement): OrderSettlement {
    switch (settlement) {
        case V0OrderSettlement.RenEx:
            return OrderSettlement.RenEx;
        case V0OrderSettlement.RenExAtomic:
            return OrderSettlement.RenExAtomic;
    }
}

export function OrderSideMapper(parity: V0OrderParity): OrderSide {
    switch (parity) {
        case V0OrderParity.BUY:
            return OrderSide.BUY;
        case V0OrderParity.SELL:
            return OrderSide.SELL;
    }
}

export function OrderTypeMapper(orderType: V0OrderType): OrderType {
    switch (orderType) {
        case V0OrderType.LIMIT:
            return OrderType.LIMIT;
        case V0OrderType.LIMIT_IOC:
            return OrderType.LIMIT_IOC;
        case V0OrderType.MIDPOINT:
            return OrderType.MIDPOINT;
        case V0OrderType.MIDPOINT_IOC:
            return OrderType.MIDPOINT_IOC;
    }
}

export function tokenToDigits(token: TokenCode): number {
    switch (token) {
        case Token.BTC:
            return 8;
        case Token.ETH:
            return 18;
        case Token.DGX:
            return 9;
        case Token.TUSD:
            return 18;
        case Token.REN:
            return 18;
        case Token.ZRX:
            return 18;
        case Token.OMG:
            return 18;
        default:
            throw new Error(`Invalid token ID: ${token}`);
    }
}
