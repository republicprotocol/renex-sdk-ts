import localforage from "localforage";
import { BalanceAction, OrderID, TraderOrder } from "../types";
import { StorageProvider } from "./interface";
import { deserializeBalanceAction, deserializeTraderOrder, serializeBalanceAction, serializeTraderOrder } from "./serializers";

const createKey = (name: string, address: string): string => `renex_sdk_${name}_${address.toLowerCase()}`;

class LocalStorage implements StorageProvider {
    private orders: LocalForage;
    private balanceActions: LocalForage;

    constructor(address?: string) {
        const storageKey = (address) ? address : "default";

        this.orders = localforage.createInstance({
            name: "orders",
            storeName: createKey("orders", storageKey),
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE
            ],
        });

        this.balanceActions = localforage.createInstance({
            name: "deposits",
            storeName: createKey("deposits", storageKey),
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
    public async getOrder(orderID: OrderID): Promise<TraderOrder | undefined> {
        const serialized = await this.orders.getItem<string | undefined>(orderID);
        if (!serialized) {
            return undefined;
        }
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
    public async getBalanceAction(txHash: string): Promise<BalanceAction | undefined> {
        const serialized = await this.balanceActions.getItem<string | undefined>(txHash);
        if (!serialized) {
            return undefined;
        }
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
