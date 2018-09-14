import localforage from "localforage";
import { BalanceAction, OrderID, TraderOrder } from "../types";
import { Storage } from "./interface";
import { deserializeBalanceAction, deserializeTraderOrder, serializeBalanceAction, serializeTraderOrder } from "./serializers";

const createKey = (name: string, address: string): string => `renex_sdk_${name}_${address.toLowerCase()}`;

class LocalStorage implements Storage {
    private orders: LocalForage;
    private balanceActions: LocalForage;

    constructor(address: string) {

        this.orders = localforage.createInstance({
            name: "orders",
            storeName: createKey("orders", address),
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE
            ],
        });

        this.balanceActions = localforage.createInstance({
            name: "deposits",
            storeName: createKey("deposits", address),
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE
            ],
        });
    }

    // Orders
    public async setOrder(order: TraderOrder): Promise<void> {
        await this.orders.setItem(order.id, serializeTraderOrder(order));
    }
    public async getOrder(orderID: OrderID): Promise<TraderOrder> {
        const serialized: string = await this.orders.getItem(orderID) as string;
        return deserializeTraderOrder(serialized);
    }
    public async getOrders(): Promise<TraderOrder[]> {
        const orders: TraderOrder[] = [];
        await this.orders.iterate((value: string) => {
            try {
                orders.push(deserializeTraderOrder(value));
            } catch (err) {
                console.error(err);
            }
        });
        return orders;
    }

    // Balances
    public async setBalanceAction(balanceAction: BalanceAction): Promise<void> {
        await this.balanceActions.setItem(balanceAction.txHash, serializeBalanceAction(balanceAction));
    }
    public async getBalanceAction(txHash: string): Promise<BalanceAction> {
        const serialized: string = await this.balanceActions.getItem(txHash) as string;
        return deserializeBalanceAction(serialized);
    }
    public async getBalanceActions(): Promise<BalanceAction[]> {
        const balanceActions: BalanceAction[] = [];
        await this.balanceActions.iterate((value: string) => {
            try {
                balanceActions.push(deserializeBalanceAction(value));
            } catch (err) {
                console.error(err);
            }
        });
        return balanceActions;
    }
}

export default LocalStorage;
