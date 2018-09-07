import { BN } from "bn.js";

import RenExSDK, { OrderID, OrderStatus } from "..//index";

import { Orderbook, RenExSettlement, withProvider } from "../contracts/contracts";
import { EncodedData, Encodings } from "../lib/encodedData";
import { NetworkData } from "../lib/network";
import { orderbookStateToOrderStatus, settlementStatusToOrderStatus } from "../lib/order";

export const status = async (sdk: RenExSDK, orderID64: OrderID): Promise<OrderStatus> => {
    sdk.contracts.orderbook = sdk.contracts.orderbook || await withProvider(sdk.web3, Orderbook).at(NetworkData.contracts[0].orderbook);
    sdk.contracts.renExSettlement = sdk.contracts.renExSettlement || await withProvider(sdk.web3, RenExSettlement).at(NetworkData.contracts[0].renExSettlement);

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
    sdk.contracts.renExSettlement = sdk.contracts.renExSettlement || await withProvider(sdk.web3, RenExSettlement).at(NetworkData.contracts[0].renExSettlement);

    const orderStatus = new BN(await sdk.contracts.renExSettlement.orderStatus(orderID));

    return orderStatus.eq(new BN(2));
};
