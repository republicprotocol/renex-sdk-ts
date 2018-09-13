import localforage from "localforage";
import { OrderID, TraderOrder } from "../index";
import { deserializeTraderOrder, serializeTraderOrder, Storage } from "./interface";

const ROOT_KEY = "renex_sdk";

const createKey = (name: string, address: string): string => `${ROOT_KEY}_${name}_${address}`;

class LocalStorage implements Storage {
    private orders: LocalForage;
    // private deposits: LocalForage;

    constructor(address: string) {

        this.orders = localforage.createInstance({
            name: "orders",
            driver: [
                localforage.INDEXEDDB,
                localforage.WEBSQL,
                localforage.LOCALSTORAGE
            ],
        });

        // // this is just for demonstration purposes
        // const originalConsoleLog = console.log;
        // function consoleLogProxy() {
        //     originalConsoleLog.apply(console, arguments);
        //     const htmlConsole = document.getElementById("htmlConsole");
        //     if (htmlConsole) {
        //         const message = Array.prototype.slice.apply(arguments, []).join(" ");
        //         htmlConsole.innerHTML += "<li>" + message + "</li>";
        //     }
        // }
        // console.log = consoleLogProxy;

        // localforage.config({
        //     name: "renex_sdk",
        //     version: 1.0,
        //     storeName: "renex_sdk",
        //     description: "RenEx SDK trader order storage"
        // });

        // this.deposits = localforage.createInstance({
        //     name: ROOT_KEY + "deposits",
        // });
    }

    // Orders
    public async setOrder(order: TraderOrder): Promise<void> {
        // const toMerge: TraderOrder = await this.getOrder(order.id)
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
                console.log(err);
            }
        });
        return orders;
    }

    // // Balances
    // public async setBalanceItem(balanceItem: any): Promise<void> {
    //     //
    // }
    // public async getBalanceItems(): Promise<any[]> {
    //     //
    // }
}

export default LocalStorage;
