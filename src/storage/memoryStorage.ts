import { BalanceAction, OrderID, TraderOrder } from "../types";
import { Storage } from "./interface";

export class MemoryStorage implements Storage {
    private orders: Map<string, TraderOrder>;
    private balanceActions: Map<string, BalanceAction>;

    constructor() {
        this.orders = new Map();
        this.balanceActions = new Map();
    }

    // Orders
    public async setOrder(order: TraderOrder): Promise<void> {
        this.orders.set(order.id, order);
    }

    public async getOrder(orderID: OrderID): Promise<TraderOrder> {
        const order = this.orders.get(orderID);
        if (order === undefined) {
            throw new Error("order not found");
        }
        return order;
    }
    public async getOrders(): Promise<TraderOrder[]> {
        return Array.from(this.orders.values());
    }

    // // Balances
    public async setBalanceAction(balanceAction: BalanceAction): Promise<void> {
        this.balanceActions.set(balanceAction.txHash, balanceAction);
    }
    public async getBalanceAction(txHash: string): Promise<BalanceAction> {
        const action = this.balanceActions.get(txHash);
        if (action === undefined) {
            throw new Error("balance action not found");
        }
        return action;
    }
    public async getBalanceActions(): Promise<BalanceAction[]> {
        return Array.from(this.balanceActions.values());
    }
}
