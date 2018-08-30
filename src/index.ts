import Web3 from "web3";
import { Provider } from "web3/types";
import { BN } from "bn.js";

import { RenExSettlement } from "./contracts";
import { RenExSettlementContract } from "@Bindings/ren_ex_settlement";

// Types not implemented yet
export type IdempotentKey = null;
export type OrderID = null;
export type Order = null;
export enum OrderStatus { }

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
    private web3: Web3;
    private renExSettlement: RenExSettlementContract;

    /**
     *Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider) {
        this.web3 = new Web3(provider);
    }

    public settled = async (orderID: OrderID): Promise<boolean> => {
        this.renExSettlement = this.renExSettlement || await RenExSettlement.deployed();

        const orderStatus = new BN(await this.renExSettlement.orderStatus(orderID));

        return orderStatus.eq(new BN(2));
    }
}

export default RenExSDK;