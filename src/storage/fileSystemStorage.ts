import expandTilde from "expand-tilde";
import storage from "node-persist";
import path from "path";

import { BalanceAction, OrderID, TraderOrder } from "../types";
import { StorageProvider } from "./interface";
import { deserializeBalanceAction, deserializeTraderOrder, serializeBalanceAction, serializeTraderOrder } from "./serializers";

interface TraderOrderMap {
    [key: string]: TraderOrder;
}

interface BalanceActionMap {
    [key: string]: BalanceAction;
}

const createKey = (name: string, address: string): string => `renex_sdk_${name}_${address.toLowerCase()}`;

export class FileSystemStorage implements StorageProvider {
    private initialized: boolean;
    private path: string;
    private ordersKey: string;
    private balanceActionsKey: string;
    private orders: TraderOrderMap;
    private balanceActions: BalanceActionMap;
    private serializedOrders: {
        [key: string]: string;
    };
    private serializedBalanceActions: {
        [key: string]: string;
    };

    constructor(storagePath: string, address?: string) {
        const storageKey = (address) ? address : "default";

        this.initialized = false;
        this.path = this.getAbsolutePath(storagePath);
        this.orders = {};
        this.balanceActions = {};

        this.serializedOrders = {};
        this.serializedBalanceActions = {};
        this.ordersKey = createKey("orders", storageKey);
        this.balanceActionsKey = createKey("balanceActions", storageKey);
    }

    public async setOrder(order: TraderOrder): Promise<void> {
        if (!this.initialized) {
            await this.init();
        }
        this.orders[order.id] = order;
        this.serializedOrders[order.id] = serializeTraderOrder(order);
        await storage.setItem(this.ordersKey, this.serializedOrders);
    }

    public async getOrder(orderID: OrderID): Promise<TraderOrder | undefined> {
        if (!this.initialized) {
            await this.init();
        }
        return Promise.resolve(this.orders[orderID]);
    }

    public async getOrders(): Promise<TraderOrder[]> {
        if (!this.initialized) {
            await this.init();
        }
        return Promise.resolve(Object.values(this.orders));
    }

    public async setBalanceAction(balanceItem: BalanceAction): Promise<void> {
        if (!this.initialized) {
            await this.init();
        }
        this.balanceActions[balanceItem.txHash] = balanceItem;
        this.serializedBalanceActions[balanceItem.txHash] = serializeBalanceAction(balanceItem);
        await storage.setItem(this.balanceActionsKey, this.serializedBalanceActions);
    }

    public async getBalanceAction(txHash: string): Promise<BalanceAction | undefined> {
        if (!this.initialized) {
            await this.init();
        }
        return Promise.resolve(this.balanceActions[txHash]);
    }

    public async getBalanceActions(): Promise<BalanceAction[]> {
        if (!this.initialized) {
            await this.init();
        }
        return Promise.resolve(Object.values(this.balanceActions));
    }

    private async init() {
        await storage.init({
            dir: this.path,
        });
        await this.restoreTraderOrders();
        await this.restoreBalanceActions();
        this.initialized = true;
    }

    private async restoreTraderOrders() {
        this.orders = {};
        const orders = await storage.getItem(this.ordersKey);
        if (orders) {
            this.serializedOrders = orders;
            for (const key of Object.keys(orders)) {
                this.orders[key] = deserializeTraderOrder(orders[key]);
            }
        }
    }

    private async restoreBalanceActions() {
        this.balanceActions = {};
        const balanceActions = await storage.getItem(this.balanceActionsKey);
        if (balanceActions) {
            this.serializedBalanceActions = balanceActions;
            for (const key of Object.keys(balanceActions)) {
                this.balanceActions[key] = deserializeBalanceAction(balanceActions[key]);
            }
        }
    }

    private getAbsolutePath(storagePath: string): string {
        if ([`.${path.sep}`, `~${path.sep}`].includes(storagePath.trim().substring(0, 2))) {
            return path.resolve(expandTilde(storagePath));
        }
        if (storagePath.trim()[0] === path.sep) {
            return path.resolve(storagePath);
        }
        throw new Error("Storage path must start with either: '~/', './', or '/'");
    }

}
