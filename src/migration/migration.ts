import { fromSmallestUnit } from "../lib/tokens";
import { TraderOrder } from "../types";
import { deserializeV0TraderOrder, idToToken, OrderSettlementMapper, OrderSideMapper, OrderTypeMapper, tokenToDigits, V0TraderOrder } from "./version0Types";

// Migrate stored orders for backwards compatibility
export function migrateV0toV1(orderString: string): TraderOrder {
    const newOrder: TraderOrder = JSON.parse(orderString);
    if (newOrder.version === 1) {
        return newOrder;
    }
    newOrder.version = 1;

    const order: V0TraderOrder = deserializeV0TraderOrder(orderString);

    if (order.matchDetails) {
        const receivedToken = idToToken(order.matchDetails.receivedToken);
        const spentToken = idToToken(order.matchDetails.spentToken);
        const fee = fromSmallestUnit(order.matchDetails.fee.toString(), tokenToDigits(receivedToken));
        const receivedVolume = fromSmallestUnit(order.matchDetails.receivedVolume.toString(), tokenToDigits(receivedToken));
        const spentVolume = fromSmallestUnit(order.matchDetails.spentVolume.toString(), tokenToDigits(spentToken));
        newOrder.matchDetails = {
            orderID: order.matchDetails.orderID,
            matchedID: order.matchDetails.matchedID,
            receivedVolume,
            spentVolume,
            fee,
            receivedToken: idToToken(order.matchDetails.receivedToken),
            spentToken: idToToken(order.matchDetails.spentToken),
        };
    }

    const receiveToken = idToToken(order.orderInputs.receiveToken);
    const spendToken = idToToken(order.orderInputs.spendToken);
    const feeToken = idToToken(order.computedOrderDetails.feeToken);
    newOrder.computedOrderDetails.receiveToken = receiveToken;
    newOrder.computedOrderDetails.spendToken = spendToken;
    newOrder.computedOrderDetails.receiveVolume = fromSmallestUnit(order.computedOrderDetails.receiveVolume.toString(), tokenToDigits(receiveToken));
    newOrder.computedOrderDetails.spendVolume = fromSmallestUnit(order.computedOrderDetails.spendVolume.toString(), tokenToDigits(spendToken));
    newOrder.computedOrderDetails.feeAmount = fromSmallestUnit(order.computedOrderDetails.feeAmount.toString(), tokenToDigits(feeToken));
    newOrder.computedOrderDetails.feeToken = feeToken;
    newOrder.computedOrderDetails.orderSettlement = OrderSettlementMapper(order.orderInputs.orderSettlement);
    newOrder.computedOrderDetails.nonce = order.orderInputs.nonce;

    const nonPriorityToken = order.orderInputs.receiveToken < order.orderInputs.spendToken ? order.orderInputs.spendToken : order.orderInputs.receiveToken;
    const priorityToken = order.orderInputs.receiveToken > order.orderInputs.spendToken ? order.orderInputs.spendToken : order.orderInputs.receiveToken;
    newOrder.orderInputs.symbol = `${nonPriorityToken}/${priorityToken}`;
    newOrder.orderInputs.side = OrderSideMapper(order.computedOrderDetails.parity);
    newOrder.orderInputs.volume = fromSmallestUnit(order.orderInputs.volume.toString(), tokenToDigits(idToToken(nonPriorityToken)));
    newOrder.orderInputs.minVolume = fromSmallestUnit(order.orderInputs.minimumVolume.toString(), tokenToDigits(idToToken(nonPriorityToken)));
    newOrder.orderInputs.type = OrderTypeMapper(order.orderInputs.type);

    return newOrder;
}
