import { OrderID, TraderOrder } from "../index";
import { Storage } from "./interface";

export class MemoryStorage implements Storage {
    private orders: Map<string, TraderOrder>;

    constructor() {
        this.orders = new Map();
    }

    // Orders
    public async setOrder(order: TraderOrder): Promise<void> {
        this.orders.set(order.id, order);
    }

    public async getOrder(orderID: OrderID): Promise<TraderOrder> {
        return this.orders.get(orderID);
    }
    public async getOrders(): Promise<TraderOrder[]> {
        return Array.from(this.orders.values());
    }

    // // Balances
    // public async setBalanceItem(balanceItem: any): Promise<void> {
    //     //
    // }
    // public async getBalanceItems(): Promise<any[]> {
    //     //
    // }
}
