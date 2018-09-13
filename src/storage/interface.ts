import BigNumber from "bignumber.js";

import { BN } from "bn.js";

import { TraderOrder } from "../index";

export interface Storage {
    // Orders
    setOrder(order: TraderOrder): Promise<void>;
    getOrder(orderID: string): Promise<TraderOrder>;
    getOrders(): Promise<TraderOrder[]>;

    // // Balances
    // setBalanceItem(balanceItem: any): Promise<void>;
    // getBalanceItems(): Promise<any[]>;
}

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

// export const mergeIntoTraderOrder = (newOrder: TraderOrder, original: TraderOrder | null): TraderOrder => {
//     if (original !== null) {
//         if (!newOrder.matchDetails) {
//             newOrder.matchDetails = original.matchDetails;
//         }
//         // If other fields are optional, add them here
//     }

//     return newOrder;
// };
