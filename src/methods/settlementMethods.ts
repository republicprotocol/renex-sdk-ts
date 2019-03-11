import BigNumber from "bignumber.js";
import BN from "bn.js";

import RenExSDK from "../index";

import { EncodedData, Encodings } from "../lib/encodedData";
import { orderbookStateToOrderStatus } from "../lib/order";
import { fromSmallestUnit } from "../lib/tokens";
import { MatchDetails, OrderID, OrderStatus, Token, TraderOrder } from "../types";
import { getTokenDetails } from "./balancesMethods";
import { fetchSwapperDOrder, fetchSwapperDOrderStatus, swapperDConnected, toOrderStatus } from "./swapperDMethods";

// This function is called if the Orderbook returns Confirmed
const settlementStatus = async (sdk: RenExSDK, orderID: EncodedData, order: TraderOrder): Promise<OrderStatus> => {
    let defaultStatus: OrderStatus = OrderStatus.CONFIRMED;
    try {
        defaultStatus = order.status !== OrderStatus.OPEN ? order.status : defaultStatus;
        // If the Swapper is disconnected we won't know the swap status
        if (!swapperDConnected(sdk)) {
            return defaultStatus;
        }
        try {
            return await fetchSwapperDOrderStatus(sdk, orderID);
        } catch (error) {
            return defaultStatus;
        }
    } catch (error) {
        return defaultStatus;
    }
};

export const fetchOrderStatus = async (sdk: RenExSDK, orderID64: OrderID, order?: TraderOrder): Promise<OrderStatus> => {
    if (!order) {
        try {
            order = await sdk._storage.getOrder(orderID64);
        } catch (error) {
            console.error(error);
        }
    }

    // Convert orderID from base64
    const orderID = new EncodedData(orderID64, Encodings.BASE64);

    if (order && order.swapServer) {
        try {
            return await fetchSwapperDOrderStatus(sdk, orderID);
        } catch (error) {
            return OrderStatus.CONFIRMED;
        }
    }

    let orderStatus: OrderStatus;

    let orderbookStatus;
    if (order && order.swapServer) {
        orderbookStatus = OrderStatus.CONFIRMED;
    } else {
        try {
            orderbookStatus = orderbookStateToOrderStatus(new BN(await sdk._contracts.orderbook.orderState(orderID.toHex())).toNumber());
        } catch (err) {
            console.error(`Unable to call orderState in status`);
            throw err;
        }
    }

    if (order && orderbookStatus === OrderStatus.CONFIRMED) {
        orderStatus = await settlementStatus(sdk, orderID, order);
    } else if (orderbookStatus === OrderStatus.OPEN) {
        if (order &&
            order.orderInputs.expiry !== 0 &&
            // Note: Date.now() returns milliseconds
            (order.orderInputs.expiry < (Date.now() / 1000))) {
            orderStatus = OrderStatus.EXPIRED;
        } else {
            orderStatus = orderbookStatus;
        }
    } else {
        orderStatus = orderbookStatus;
    }

    // Update local storage (without awaiting)
    if (order) {
        order.status = orderStatus;
        await sdk._storage.setOrder(order);
    }

    return orderStatus;
};

/**
 * Returns the percentage fees required by the darknodes.
 */
export const darknodeFees = async (sdk: RenExSDK): Promise<BigNumber> => {
    const numerator = new BigNumber(await sdk._contracts.renExSettlement.DARKNODE_FEES_NUMERATOR());
    const denominator = new BigNumber(await sdk._contracts.renExSettlement.DARKNODE_FEES_DENOMINATOR());
    return numerator.dividedBy(denominator);
};

export const matchDetails = async (sdk: RenExSDK, orderID64: OrderID): Promise<MatchDetails | undefined> => {

    // Check if we already have the match details
    const storedOrder = await sdk._storage.getOrder(orderID64);
    if (storedOrder && storedOrder.matchDetails) {
        return storedOrder.matchDetails;
    }

    const orderID = new EncodedData(orderID64, Encodings.BASE64);
    const details = await sdk._contracts.renExSettlement.getMatchDetails(orderID.toHex());
    const matchedID = new EncodedData(details.matchedID, Encodings.HEX);

    let fee: string;
    let spentToken: Token;
    let spentVolume: string;
    let receivedToken: Token;
    let receivedVolume: string;
    if (storedOrder) {
        let swap;
        try {
            swap = await fetchSwapperDOrder(sdk, orderID);
        } catch (error) {
            return undefined;
        }
        if (toOrderStatus(swap.status) !== OrderStatus.SETTLED) {
            return undefined;
        }
        fee = swap.sendCost[swap.sendToken];
        spentToken = swap.sendToken;
        spentVolume = new BigNumber(swap.sendAmount).toFixed();
        receivedToken = swap.receiveToken;
        receivedVolume = new BigNumber(swap.receiveAmount).minus(swap.receiveCost[swap.receiveToken]).toFixed();
    } else {
        return undefined;
    }

    const spentTokenDetails = await getTokenDetails(sdk, spentToken);
    const receivedTokenDetails = await getTokenDetails(sdk, receivedToken);

    const orderMatchDetails: MatchDetails = {
        orderID: orderID64,
        matchedID: matchedID.toBase64(),
        receivedToken,
        receivedVolume: fromSmallestUnit(receivedVolume, receivedTokenDetails),
        fee: fromSmallestUnit(fee, spentTokenDetails),
        spentToken,
        spentVolume: fromSmallestUnit(spentVolume, spentTokenDetails),
    };

    // Update local storage (without awaiting)
    sdk._storage.getOrder(orderID64).then(async (reStoredOrder: TraderOrder | undefined) => {
        if (reStoredOrder) {
            reStoredOrder.matchDetails = orderMatchDetails;
            await sdk._storage.setOrder(reStoredOrder);
        }
    }).catch(console.error);

    return orderMatchDetails;
};
