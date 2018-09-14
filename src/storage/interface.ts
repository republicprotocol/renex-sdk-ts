import { BalanceAction, TraderOrder } from "../types";

export interface Storage {
    // Orders
    setOrder(order: TraderOrder): Promise<void>;
    getOrder(orderID: string): Promise<TraderOrder>;
    getOrders(): Promise<TraderOrder[]>;

    // Balances
    setBalanceAction(balanceItem: BalanceAction): Promise<void>;
    getBalanceAction(txHash: string): Promise<BalanceAction>;
    getBalanceActions(): Promise<BalanceAction[]>;
}
