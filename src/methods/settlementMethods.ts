import { BN } from "bn.js";

import RenExSDK from "../index";

import { getOrderStatus } from "../lib/atomic";
import { EncodedData, Encodings } from "../lib/encodedData";
import { orderbookStateToOrderStatus, settlementStatusToOrderStatus } from "../lib/order";
import { MatchDetails, OrderID, OrderSettlement, OrderStatus, TraderOrder } from "../types";

// This function is called if the Orderbook returns Confirmed
const settlementStatus = async (sdk: RenExSDK, orderID: EncodedData): Promise<OrderStatus> => {

    try {
        await matchDetails(sdk, orderID.toBase64());
    } catch (error) {
        return OrderStatus.CONFIRMED;
    }

    // Retrieve order from storage to see if order is an Atomic Swap
    const storedOrder = await sdk._storage.getOrder(orderID.toBase64());

    // If not atomic, return settled
    if (!storedOrder || storedOrder.orderInputs.orderSettlement === OrderSettlement.RenEx) {
        return OrderStatus.SETTLED;
    }

    const storedStatus = !storedOrder.status ? OrderStatus.CONFIRMED : storedOrder.status;

    // If RenEx Swapper is not connected, return previous status
    if (!sdk.atomConnected()) {
        return storedStatus;
    }

    // Ask RenEx Swapper for status
    try {
        let orderStatus = await getOrderStatus(orderID);

        // The Swapper may not have the most recent status
        if (orderStatus === OrderStatus.OPEN || orderStatus === OrderStatus.NOT_SUBMITTED) {
            orderStatus = OrderStatus.CONFIRMED;
        }

        return orderStatus;
    } catch (error) {
        // Return previous status;
        return storedStatus;
    }
};

export const status = async (sdk: RenExSDK, orderID64: OrderID): Promise<OrderStatus> => {
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
        if (storedOrder && storedOrder.orderInputs.orderSettlement === OrderSettlement.RenEx && orderStatus === OrderStatus.CONFIRMED) {
            let currentBlockNumber = 0;
            try {
                currentBlockNumber = await sdk.web3().eth.getBlockNumber();
            } catch (error) {
                console.error(error);
            }
            if (currentBlockNumber > 0) {
                let blockNumber = 0;
                try {
                    blockNumber = await sdk.getOrderBlockNumber(orderID64);
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

export const matchDetails = async (sdk: RenExSDK, orderID64: OrderID): Promise<MatchDetails> => {

    // Check if we already have the match details
    const storedOrder = await sdk._storage.getOrder(orderID64);
    if (storedOrder && storedOrder.matchDetails) {
        return storedOrder.matchDetails;
    }

    const orderID = new EncodedData(orderID64, Encodings.BASE64);
    const details = await sdk._contracts.renExSettlement.getMatchDetails(orderID.toHex());

    const matchedID = new EncodedData(details.matchedID, Encodings.HEX);

    if (!details.settled) {
        throw new Error("Not settled");
    }

    const orderMatchDetails: MatchDetails = (details.orderIsBuy) ?
        {
            orderID: orderID64,
            matchedID: matchedID.toBase64(),

            receivedToken: new BN(details.secondaryToken).toNumber(),
            receivedVolume: new BN(details.secondaryVolume),

            fee: new BN(details.priorityFee),
            spentToken: new BN(details.priorityToken).toNumber(),
            spentVolume: new BN(details.priorityVolume),
        } :
        {
            orderID: orderID64,
            matchedID: matchedID.toBase64(),

            receivedToken: new BN(details.priorityToken).toNumber(),
            receivedVolume: new BN(details.priorityVolume),

            fee: new BN(details.secondaryFee),
            spentToken: new BN(details.secondaryToken).toNumber(),
            spentVolume: new BN(details.secondaryVolume),
        };

    // If the order is an Atomic Swap, add fees and volumes since fees are
    // separate
    if (storedOrder && storedOrder.orderInputs.orderSettlement === OrderSettlement.RenExAtomic) {
        const [receivedVolume, spentVolume] = (details.orderIsBuy) ?
            [
                new BN(details.secondaryVolume).add(new BN(details.secondaryFee)),
                new BN(details.priorityVolume).add(new BN(details.priorityFee)),
            ] : [
                new BN(details.priorityVolume).add(new BN(details.priorityFee)),
                new BN(details.secondaryVolume).add(new BN(details.secondaryFee)),
            ];
        orderMatchDetails.receivedVolume = receivedVolume;
        orderMatchDetails.spentVolume = spentVolume;

        // TODO: Calculate fees
        orderMatchDetails.fee = new BN(0);
    }

    // Update local storage (without awaiting)
    sdk._storage.getOrder(orderID64).then(async (reStoredOrder: TraderOrder | undefined) => {
        if (reStoredOrder) {
            reStoredOrder.matchDetails = orderMatchDetails;
            await sdk._storage.setOrder(reStoredOrder);
        }
    }).catch(console.error);

    return orderMatchDetails;
};
