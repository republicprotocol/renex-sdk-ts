import Web3 from "web3";
import { Provider } from "web3/types";
import { BN } from "bn.js";

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
    transfer(address: string, token: number, value: BN);
    balance(token: number): BN;
    usableBalance(token: number): BN;
    deposit(token: number, value: BN);
    withdraw(token: number, value: BN, forced: boolean, key: IdempotentKey): IdempotentKey;
    status(orderID: OrderID): OrderStatus;
    settled(orderID: OrderID): boolean;
    openOrder(order: Order);
    cancelOrder(orderID: OrderID);
    listOrdersByTrader(address: string): OrderID[];
    listOrdersByStatus(status: OrderStatus): OrderID[];
}

/**
 * This is the concrete class that implements the RenExSDK interface.
 *
 * @class RenExSDK
 * @implements {RenExSDK}
 */
class RenExSDK implements RenExSDK {
    private web3;

    /**
     *Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider) {
        this.web3 = new Web3(provider);
    }
}

export default RenExSDK;