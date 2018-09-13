import BigNumber from "bignumber.js";
import { BN } from "bn.js";

import { BalanceAction, TraderOrder } from "../index";

export const serializeTraderOrder = (order: TraderOrder): string => {
    return JSON.stringify(order);
};

export const deserializeTraderOrder = (orderString: string): TraderOrder => {
    const order: TraderOrder = JSON.parse(orderString);

    if (order.matchDetails) {
        order.matchDetails.fee = new BN(order.matchDetails.fee, "hex");
        order.matchDetails.receivedVolume = new BN(order.matchDetails.receivedVolume, "hex");
        order.matchDetails.spentVolume = new BN(order.matchDetails.spentVolume, "hex");
    }

    order.computedOrderDetails.receiveVolume = new BN(order.computedOrderDetails.receiveVolume, "hex");
    order.computedOrderDetails.spendVolume = new BN(order.computedOrderDetails.spendVolume, "hex");

    order.orderInputs.minimumVolume = new BN(order.orderInputs.minimumVolume, "hex");
    order.orderInputs.nonce = new BN(order.orderInputs.nonce, "hex");
    order.orderInputs.price = new BigNumber(order.orderInputs.price);
    order.orderInputs.volume = new BN(order.orderInputs.volume, "hex");

    return order;
};

export const serializeBalanceAction = (balanceAction: BalanceAction): string => {
    return JSON.stringify(balanceAction);
};

export const deserializeBalanceAction = (balanceActionString: string): BalanceAction => {
    const balanceAction: BalanceAction = JSON.parse(balanceActionString);

    balanceAction.amount = new BN(balanceAction.amount);

    return balanceAction;
};
