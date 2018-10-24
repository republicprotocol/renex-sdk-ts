import { BalanceAction, OrderID, TraderOrder } from "../types";
import { StorageProvider } from "./interface";

export class MemoryStorage implements StorageProvider {
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

    public async getOrder(orderID: OrderID): Promise<TraderOrder | undefined> {
        return this.orders.get(orderID);
    }
    public async getOrders(): Promise<TraderOrder[]> {
        return Array.from(this.orders.values());
    }

    // // Balances
    public async setBalanceAction(balanceAction: BalanceAction): Promise<void> {
        this.balanceActions.set(balanceAction.txHash, balanceAction);
    }
    public async getBalanceAction(txHash: string): Promise<BalanceAction | undefined> {
        return this.balanceActions.get(txHash);
    }
    public async getBalanceActions(): Promise<BalanceAction[]> {
        return Array.from(this.balanceActions.values());
    }
}
