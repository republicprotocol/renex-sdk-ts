import Web3 from "web3";
import { Provider } from "web3/types";
import { BN } from "bn.js";

import { RenExSettlementContract } from "@Bindings/ren_ex_settlement";
import { settled, status } from "@Methods/settlementMethods";
import { listOrdersByStatus, listOrdersByTrader, cancelOrder, openOrder } from "@Methods/orderbookMethods";
import { deposit, withdraw, usableBalance, balance } from "@Methods/balancesMethods";
import { address, transfer } from "@Methods/generalMethods";

// Types not implemented yet
export type IdempotentKey = null;
export type OrderID = null;
export type Order = null;
export enum OrderStatus { }

declare var self:any;

/**
 * This is the interface that the SDK exposes.
 *
 * @interface RenExSDK
 */
interface RenExSDK {
    address(): string;
    transfer(address: string, token: number, value: BN): Promise<void>;
    balance(token: number): Promise<BN>;
    usableBalance(token: number): Promise<BN>;
    deposit(token: number, value: BN): Promise<void>;
    withdraw(token: number, value: BN, forced: boolean, key: IdempotentKey): Promise<IdempotentKey>;
    status(orderID: OrderID): Promise<OrderStatus>;
    settled(orderID: OrderID): Promise<boolean>;
    openOrder(order: Order): Promise<void>;
    cancelOrder(orderID: OrderID): Promise<void>;
    listOrdersByTrader(address: string): Promise<OrderID[]>;
    listOrdersByStatus(status: OrderStatus): Promise<OrderID[]>;
}

/**
 * This is the concrete class that implements the RenExSDK interface.
 *
 * @class RenExSDK
 * @implements {RenExSDK}
 */
class RenExSDK implements RenExSDK {
    public web3: Web3;
    public contracts: {
        renExSettlement?: RenExSettlementContract,
    } = {};

    /**
     *Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider) {
        this.web3 = new Web3(provider);
    }

    public address = (): string => address(this);
    public transfer = (address: string, token: number, value: BN): Promise<void> => transfer(this, address, token, value);
    public balance = (token: number): Promise<BN> => balance(this, token);
    public usableBalance = (token: number): Promise<BN> => usableBalance(this, token);
    public deposit = (token: number, value: BN): Promise<void> => deposit(this, token, value);
    public withdraw = (token: number, value: BN, forced: boolean, key: IdempotentKey): Promise<IdempotentKey> => withdraw(this, token, value, forced, key);
    public status = (orderID: OrderID): Promise<OrderStatus> => status(this, orderID);
    public settled = (orderID: OrderID): Promise<boolean> => settled(this, orderID);
    public openOrder = (order: Order): Promise<void> => openOrder(this, order);
    public cancelOrder = (orderID: OrderID): Promise<void> => cancelOrder(this, orderID);
    public listOrdersByTrader = (address: string): Promise<OrderID[]> => listOrdersByTrader(this, address);
    public listOrdersByStatus = (status: OrderStatus): Promise<OrderID[]> => listOrdersByStatus(this, status);
}

export default RenExSDK;