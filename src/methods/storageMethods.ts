import RenExSDK from "../index";
import { BalanceAction, TraderOrder } from "../types";
import { updateAllBalanceActionStatuses } from "./balanceActionMethods";
import { updateAllOrderStatuses } from "./orderbookMethods";

export const fetchTraderOrders = async (sdk: RenExSDK, options = { refresh: true }): Promise<TraderOrder[]> => {
    // Get all the orders
    const traderOrders = await sdk._storage.getOrders();
    if (options.refresh) {
        // Check if any order statuses have been updated
        const changedOrders = await updateAllOrderStatuses(sdk, traderOrders);
        // Update the local tradeOrders variable with these new statuses
        traderOrders.map((order, index) => {
            const newStatus = changedOrders.get(order.id);
            if (newStatus) {
                traderOrders[index].status = newStatus;
            }
        });
    }
    // Return orders based on computed date
    return traderOrders.sort((a, b) => a.computedOrderDetails.date < b.computedOrderDetails.date ? -1 : 1);
};

export const fetchBalanceActions = async (sdk: RenExSDK, options = { refresh: true }): Promise<BalanceAction[]> => {
    const balanceActions = await sdk._storage.getBalanceActions();
    if (options.refresh) {
        // Check if any statuses have been updated
        const changedActions = await updateAllBalanceActionStatuses(sdk, balanceActions);
        // Update the local balanceActions variable with these new statuses
        balanceActions.map((action, index) => {
            const newStatus = changedActions.get(action.txHash);
            if (newStatus) {
                balanceActions[index].status = newStatus;
            }
        });
    }
    return balanceActions.sort((a, b) => a.time < b.time ? -1 : 1);
};
