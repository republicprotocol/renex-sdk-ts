import RenExSDK from "../index";
import { OrderID, TransactionOptions } from "../types";

export const cancelOrder = async (
    _sdk: RenExSDK,
    _orderID: OrderID,
    _options?: TransactionOptions,
): Promise<void> => {
    throw new Error("Not implemented");
    // const orderIDHex = new EncodedData(orderID, Encodings.BASE64).toHex();
};
