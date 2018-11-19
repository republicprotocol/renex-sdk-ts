import { BN } from "bn.js";
import { PromiEvent } from "web3/types";
import RenExSDK from "../index";
import { GetOrdersFilter, Order, OrderInputs, TraderOrder, Transaction } from "../types";
export declare const orderFeeNumerator: (sdk: RenExSDK) => Promise<BN>;
export declare const orderFeeDenominator: (sdk: RenExSDK) => Promise<BN>;
export declare const openOrder: (sdk: RenExSDK, orderInputsIn: OrderInputs, simpleConsole?: import("types").SimpleConsole) => Promise<{
    traderOrder: TraderOrder;
    promiEvent: PromiEvent<Transaction> | null;
}>;
export declare const cancelOrder: (sdk: RenExSDK, orderID: string) => Promise<{
    promiEvent: PromiEvent<Transaction> | null;
}>;
export declare const getOrders: (sdk: RenExSDK, filter: GetOrdersFilter) => Promise<Order[]>;
export declare const getOrderBlockNumber: (sdk: RenExSDK, orderID: string) => Promise<number>;
