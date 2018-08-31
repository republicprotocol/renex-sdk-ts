import { BN } from "bn.js";

import RenExSDK, { OrderID, OrderStatus } from "@Root/index";
import { UNIMPLEMENTED } from "@Lib/errors";
import { RenExSettlement } from "@Contracts/contracts";

export const status = async (sdk: RenExSDK, orderID: OrderID): Promise<OrderStatus> => {
    throw new Error(UNIMPLEMENTED);
}

export const settled = async (sdk: RenExSDK, orderID: OrderID): Promise<boolean> => {
    sdk.contracts.renExSettlement = sdk.contracts.renExSettlement || await RenExSettlement.deployed();

    const orderStatus = new BN(await sdk.contracts.renExSettlement.orderStatus(orderID));

    return orderStatus.eq(new BN(2));
}
