import BigNumber from "bignumber.js";
import BN from "bn.js";

import RenExSDK from "../index";

import { EncodedData, Encodings } from "../lib/encodedData";
import { orderbookStateToOrderStatus } from "../lib/order";
import { fromSmallestUnit, idToToken } from "../lib/tokens";
import { MatchDetails, OrderID, OrderSettlement, OrderStatus, TraderOrder } from "../types";
import { atomConnected, fetchAtomicOrder, fetchAtomicOrderStatus } from "./atomicMethods";
import { getTokenDetails } from "./balancesMethods";
import { getOrderBlockNumber } from "./orderbookMethods";

// This function is called if the Orderbook returns Confirmed
const settlementStatus = async (sdk: RenExSDK, orderID: EncodedData): Promise<OrderStatus> => {
    let defaultStatus: OrderStatus = OrderStatus.CONFIRMED;
    try {
        const storedOrder = await sdk._storage.getOrder(orderID.toBase64());
        if (storedOrder) {
            defaultStatus = !storedOrder.status ? defaultStatus : storedOrder.status;
            // If order is an atomic order, ask Swapper for status
            if (storedOrder.computedOrderDetails.orderSettlement === OrderSettlement.RenExAtomic) {
                // If the Swapper is disconnected we won't know the swap status
                if (!atomConnected(sdk)) {
                    return defaultStatus;
                }
                const status = await fetchAtomicOrderStatus(sdk, orderID);
                return status;
            }
        }
        const match = await matchDetails(sdk, orderID.toBase64());
        if (match !== undefined) {
            return OrderStatus.SETTLED;
        }
    } catch (error) {
        return defaultStatus;
    }
    return defaultStatus;
};

export const fetchOrderStatus = async (sdk: RenExSDK, orderID64: OrderID): Promise<OrderStatus> => {
    // Convert orderID from base64
    const orderID = new EncodedData(orderID64, Encodings.BASE64);

    let orderStatus: OrderStatus;

    let orderbookStatus;
    try {
        orderbookStatus = orderbookStateToOrderStatus(new BN(await sdk._contracts.orderbook.orderState(orderID.toHex())).toNumber());
    } catch (err) {
        console.error(`Unable to call orderState in status`);
        throw err;
    }
    if (orderbookStatus === OrderStatus.CONFIRMED) {
        orderStatus = await settlementStatus(sdk, orderID);

        // If the order is still settling, check how much time has passed. We
        // do this since we do not want the user's funds to be locked up
        // forever if a trader attempts to settle an order without funds they
        // actually possess.
        const storedOrder = await sdk._storage.getOrder(orderID64);
        if (storedOrder && storedOrder.computedOrderDetails.orderSettlement === OrderSettlement.RenEx && orderStatus === OrderStatus.CONFIRMED) {
            let currentBlockNumber = 0;
            try {
                currentBlockNumber = await sdk.getWeb3().eth.getBlockNumber();
            } catch (error) {
                console.error(error);
            }
            if (currentBlockNumber > 0) {
                let blockNumber = 0;
                try {
                    blockNumber = await getOrderBlockNumber(sdk, orderID64);
                } catch (error) {
                    console.error(error);
                }
                if (blockNumber > 0 && currentBlockNumber - blockNumber > 300) {
                    orderStatus = OrderStatus.FAILED_TO_SETTLE;
                }
            }
        }
    } else {
        orderStatus = orderbookStatus;
    }

    // Update local storage (without awaiting)
    sdk._storage.getOrder(orderID64).then(async (storedOrder: TraderOrder | undefined) => {
        if (storedOrder) {
            storedOrder.status = orderStatus;
            await sdk._storage.setOrder(storedOrder);
        }
    }).catch(console.error);

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
    let spentToken: string;
    let spentVolume: string;
    let receivedToken: string;
    let receivedVolume: string;
    if (storedOrder && storedOrder.computedOrderDetails.orderSettlement === OrderSettlement.RenEx) {
        if (details.settled) {
            return undefined;
        }
        fee = (details.orderIsBuy) ? details.priorityFee : details.secondaryFee;
        spentToken = idToToken(new BN((details.orderIsBuy) ? details.priorityToken : details.secondaryToken).toNumber());
        spentVolume = (details.orderIsBuy) ? details.priorityVolume : details.secondaryVolume;
        receivedToken = idToToken(new BN((details.orderIsBuy) ? details.secondaryToken : details.priorityToken).toNumber());
        receivedVolume = (details.orderIsBuy) ? details.secondaryVolume : details.priorityVolume;
    } else if (storedOrder && storedOrder.computedOrderDetails.orderSettlement === OrderSettlement.RenExAtomic) {
        const swap = await fetchAtomicOrder(sdk, orderID);
        fee = swap.sendCost[swap.sendToken];
        spentToken = swap.sendToken;
        spentVolume = new BigNumber(swap.sendAmount).plus(swap.sendCost[swap.sendToken]).toFixed();
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
