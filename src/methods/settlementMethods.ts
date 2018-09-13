import { BN } from "bn.js";

import RenExSDK, { MatchDetails, OrderID, OrderStatus, TraderOrder } from "../index";

import { EncodedData, Encodings } from "../lib/encodedData";
import { orderbookStateToOrderStatus, settlementStatusToOrderStatus } from "../lib/order";

export const status = async (sdk: RenExSDK, orderID64: OrderID): Promise<OrderStatus> => {
    // Convert orderID from base64 to hex
    const orderID = new EncodedData(orderID64, Encodings.BASE64).toHex();

    let orderStatus: OrderStatus;

    const orderbookStatus = orderbookStateToOrderStatus(new BN(await sdk.contracts.orderbook.orderState(orderID)).toNumber());
    switch (orderbookStatus) {
        case OrderStatus.CONFIRMED:
            const settlementStatus = new BN(await sdk.contracts.renExSettlement.orderStatus(orderID)).toNumber();
            orderStatus = settlementStatusToOrderStatus(settlementStatus);
            break;
        default:
            orderStatus = orderbookStatus;
    }

    // Update local storage (without awaiting)
    sdk.storage.getOrder(orderID64).then(async (storedOrder: TraderOrder) => {
        if (storedOrder !== null) {
            storedOrder.status = orderStatus;
            await sdk.storage.setOrder(storedOrder);
        }
    }).catch(console.error);

    return orderStatus;
};

export const matchDetails = async (sdk: RenExSDK, orderID64: OrderID): Promise<MatchDetails> => {
    const orderID = new EncodedData(orderID64, Encodings.BASE64);
    const details = await sdk.contracts.renExSettlement.getMatchDetails(orderID.toHex());

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
    sdk.storage.getOrder(orderID64).then(async (storedOrder: TraderOrder) => {
        if (storedOrder !== null) {
            storedOrder.matchDetails = orderMatchDetails;
            await sdk.storage.setOrder(storedOrder);
        }
    }).catch(console.error);

    return orderMatchDetails;
};
