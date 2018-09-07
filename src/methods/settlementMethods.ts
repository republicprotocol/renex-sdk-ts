import { BN } from "bn.js";

import RenExSDK, { OrderID, OrderStatus } from "..//index";

import { EncodedData, Encodings } from "../lib/encodedData";
import { NetworkData } from "../lib/network";
import { orderbookStateToOrderStatus, settlementStatusToOrderStatus } from "../lib/order";

export const status = async (sdk: RenExSDK, orderID64: OrderID): Promise<OrderStatus> => {
    // Convert orderID from base64 to hex
    const orderID = new EncodedData(orderID64, Encodings.BASE64).toHex();

    const obStatus = orderbookStateToOrderStatus(new BN(await sdk.contracts.orderbook.orderState(orderID)).toNumber());
    switch (obStatus) {
        case OrderStatus.CONFIRMED:
            const settlementStatus = new BN(await sdk.contracts.renExSettlement.orderStatus(orderID)).toNumber();
            return settlementStatusToOrderStatus(settlementStatus);
        default:
            return obStatus;
    }
};

export const settled = async (sdk: RenExSDK, orderID: OrderID): Promise<boolean> => {
    const orderStatus = new BN(await sdk.contracts.renExSettlement.orderStatus(orderID));

    return orderStatus.eq(new BN(2));
};
