import { BN } from "bn.js";

import RenExSDK, { OrderID, OrderStatus } from "@Root/index";

import { Orderbook, RenExSettlement, withProvider } from "@Contracts/contracts";
import { ErrUnknownOrderStatus } from "@Lib/errors";
import { NetworkData } from "@Lib/network";
import { orderbookStateToOrderStatus, settlementStatusToOrderStatus } from "@Lib/order";

export const status = async (sdk: RenExSDK, orderID: OrderID): Promise<OrderStatus> => {
    sdk.contracts.orderbook = sdk.contracts.orderbook || await withProvider(sdk.web3, Orderbook).at(NetworkData.contracts[0].orderbook);
    sdk.contracts.renExSettlement = sdk.contracts.renExSettlement || await withProvider(sdk.web3, RenExSettlement).at(NetworkData.contracts[0].renExSettlement);

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
