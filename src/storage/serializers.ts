import BigNumber from "bignumber.js";
import { BN } from "bn.js";

import { BalanceAction, TraderOrder } from "../types";

export const serializeTraderOrder = (order: TraderOrder): string => {
    return JSON.stringify(order);
};

export const deserializeTraderOrder = (orderString: string): TraderOrder => {
    const order: TraderOrder = JSON.parse(orderString);

    if (order.matchDetails) {
        order.matchDetails.fee = new BigNumber(order.matchDetails.fee);
        order.matchDetails.receivedVolume = new BigNumber(order.matchDetails.receivedVolume);
        order.matchDetails.spentVolume = new BigNumber(order.matchDetails.spentVolume);
    }

    order.computedOrderDetails.receiveVolume = new BigNumber(order.computedOrderDetails.receiveVolume);
    order.computedOrderDetails.spendVolume = new BigNumber(order.computedOrderDetails.spendVolume);
    order.computedOrderDetails.feeAmount = new BigNumber(order.computedOrderDetails.feeAmount);
    order.computedOrderDetails.nonce = new BN(order.computedOrderDetails.nonce, "hex");

    order.orderInputs.minVolume = new BigNumber(order.orderInputs.minVolume);
    order.orderInputs.price = new BigNumber(order.orderInputs.price);
    order.orderInputs.volume = new BigNumber(order.orderInputs.volume);

    return order;
};

export const serializeBalanceAction = (balanceAction: BalanceAction): string => {
    return JSON.stringify(balanceAction);
};

export const deserializeBalanceAction = (balanceActionString: string): BalanceAction => {
    const balanceAction: BalanceAction = JSON.parse(balanceActionString);

    balanceAction.amount = new BigNumber(balanceAction.amount);

    return balanceAction;
};
