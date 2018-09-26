import { BN } from "bn.js";

import RenExSDK from "../index";

import { getOrderStatus } from "../lib/atomic";
import { EncodedData, Encodings } from "../lib/encodedData";
import { orderbookStateToOrderStatus, settlementStatusToOrderStatus } from "../lib/order";
import { MatchDetails, OrderID, OrderSettlement, OrderStatus, TraderOrder } from "../types";

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
        let settlementStatus: number;
        try {
            settlementStatus = new BN(await sdk._contracts.renExSettlement.orderStatus(orderID.toHex())).toNumber();
        } catch (error) {
            console.error(error);
            throw error;
        }
        orderStatus = settlementStatusToOrderStatus(settlementStatus);
        if (orderStatus === OrderStatus.SETTLED) {
            const storedOrder = await sdk._storage.getOrder(orderID64);
            if (storedOrder === undefined) {
                // This order is potentially an atomic swap where settled isn't actually settled.
                // So for now just return confirmed.
                orderStatus = OrderStatus.CONFIRMED;
            } else if (storedOrder.orderInputs.orderSettlement === OrderSettlement.RenExAtomic && sdk.atomConnected()) {
                try {
                    orderStatus = await getOrderStatus(orderID);
                } catch (error) {
                    console.error(error);
                    orderStatus = storedOrder.status;
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

    // Update local storage (without awaiting)
    sdk._storage.getOrder(orderID64).then(async (storedOrder: TraderOrder | undefined) => {
        if (storedOrder) {
            storedOrder.matchDetails = orderMatchDetails;
            await sdk._storage.setOrder(storedOrder);
        }
    }).catch(console.error);

    return orderMatchDetails;
};
