import * as renexNode from "../lib/renexNode";

import RenExSDK from "../index";

import { OrderID, TransactionOptions } from "../types";

export const cancelOrder = async (
    sdk: RenExSDK,
    orderID: OrderID,
    options: TransactionOptions,
): Promise<void> => {
    await renexNode.cancelOrder(sdk._networkData.renexNode, orderID, options.token);
};
