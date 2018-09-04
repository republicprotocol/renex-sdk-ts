import { BN } from "bn.js";

import { RenExSettlement, withProvider } from "@Contracts/contracts";
import { NetworkData } from "@Lib/network";
import RenExSDK, { OrderID, OrderStatus } from "@Root/index";

export const status = async (sdk: RenExSDK, orderID: OrderID): Promise<OrderStatus> => {
    sdk.contracts.renExSettlement = sdk.contracts.renExSettlement || await withProvider(sdk.web3, RenExSettlement).at(NetworkData.contracts[0].renExSettlement);

    return new BN(await sdk.contracts.renExSettlement.orderStatus(orderID));
};

export const settled = async (sdk: RenExSDK, orderID: OrderID): Promise<boolean> => {
    sdk.contracts.renExSettlement = sdk.contracts.renExSettlement || await withProvider(sdk.web3, RenExSettlement).at(NetworkData.contracts[0].renExSettlement);

    const orderStatus = new BN(await sdk.contracts.renExSettlement.orderStatus("orderID"));

    return orderStatus.eq(new BN(2));
};
