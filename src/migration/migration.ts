import { fromSmallestUnit } from "../lib/tokens";
import { BalanceAction, MatchDetails, TraderOrder } from "../types";
import { BalanceActionMapper, deserializeV0BalanceAction, deserializeV0TraderOrder, idToToken, OrderSettlementMapper, OrderSideMapper, OrderStatusMapper, OrderTypeMapper, tokenToDigits, TransactionStatusMapper, V0BalanceAction, V0TraderOrder } from "./version0Types";

// Migrate stored orders for backwards compatibility
export function migrateV0TraderOrdertoV1(orderString: string): TraderOrder {
    let matchDetails: MatchDetails | undefined;
    const parsedOrder = JSON.parse(orderString);
    if (parsedOrder.version === 1) {
        return parsedOrder;
    }

    const order: V0TraderOrder = deserializeV0TraderOrder(orderString);
    if (order.matchDetails) {
        const receivedToken = idToToken(order.matchDetails.receivedToken);
        const spentToken = idToToken(order.matchDetails.spentToken);
        const fee = fromSmallestUnit(order.matchDetails.fee.toString(), tokenToDigits(receivedToken));
        const receivedVolume = fromSmallestUnit(order.matchDetails.receivedVolume.toString(), tokenToDigits(receivedToken));
        const spentVolume = fromSmallestUnit(order.matchDetails.spentVolume.toString(), tokenToDigits(spentToken));
        matchDetails = {
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
    const nonPriorityToken = order.orderInputs.receiveToken < order.orderInputs.spendToken ? order.orderInputs.spendToken : order.orderInputs.receiveToken;
    const priorityToken = order.orderInputs.receiveToken > order.orderInputs.spendToken ? order.orderInputs.spendToken : order.orderInputs.receiveToken;

    const newOrder: TraderOrder = {
        version: 1,
        id: order.id,
        trader: order.trader,
        status: OrderStatusMapper(order.status),
        matchDetails,
        computedOrderDetails: {
            receiveToken,
            spendToken,
            receiveVolume: fromSmallestUnit(order.computedOrderDetails.receiveVolume.toString(), tokenToDigits(receiveToken)),
            spendVolume: fromSmallestUnit(order.computedOrderDetails.spendVolume.toString(), tokenToDigits(spendToken)),
            date: order.computedOrderDetails.date,
            feeAmount: fromSmallestUnit(order.computedOrderDetails.feeAmount.toString(), tokenToDigits(feeToken)),
            feeToken,
            orderSettlement: OrderSettlementMapper(order.orderInputs.orderSettlement),
            nonce: order.orderInputs.nonce,
        },
        orderInputs: {
            symbol: `${idToToken(nonPriorityToken)}/${idToToken(priorityToken)}`,
            side: OrderSideMapper(order.computedOrderDetails.parity),
            price: order.orderInputs.price,
            volume: fromSmallestUnit(order.orderInputs.volume.toString(), tokenToDigits(idToToken(nonPriorityToken))),
            minVolume: fromSmallestUnit(order.orderInputs.minimumVolume.toString(), tokenToDigits(idToToken(nonPriorityToken))),
            type: OrderTypeMapper(order.orderInputs.type),
            expiry: order.orderInputs.expiry,
        },
        transactionHash: order.transactionHash,
    };
    return newOrder;
}

export function migrateV0BalanceActiontoV1(balanceActionString: string): BalanceAction {
    const parsedBalanceAction = JSON.parse(balanceActionString);
    if (parsedBalanceAction.version === 1) {
        return parsedBalanceAction;
    }

    const action: V0BalanceAction = deserializeV0BalanceAction(balanceActionString);
    const token = idToToken(action.token);
    const amount = fromSmallestUnit(action.amount.toString(), tokenToDigits(token));
    const newBalanceAction: BalanceAction = {
        version: 1,
        action: BalanceActionMapper(action.action),
        amount,
        time: action.time,
        status: TransactionStatusMapper(action.status),
        token,
        trader: action.trader,
        txHash: action.txHash,
        nonce: action.nonce,
    };
    return newBalanceAction;
}
