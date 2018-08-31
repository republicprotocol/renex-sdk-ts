import RenExSDK, { Order, OrderID, OrderStatus } from "@Root/index";
import { UNIMPLEMENTED } from "@Lib/errors";

export const openOrder = async (sdk: RenExSDK, order: Order): Promise<void> => {
    throw new Error(UNIMPLEMENTED);
}

export const cancelOrder = async (sdk: RenExSDK, orderID: OrderID): Promise<void> => {
    throw new Error(UNIMPLEMENTED);
}

export const listOrdersByTrader = async (sdk: RenExSDK, address: string): Promise<OrderID[]> => {
    throw new Error(UNIMPLEMENTED);
}

export const listOrdersByStatus = async (sdk: RenExSDK, status: OrderStatus): Promise<OrderID[]> => {
    throw new Error(UNIMPLEMENTED);
}
