import BigNumber from "bignumber.js";
import Web3 from "web3";

import { BN } from "bn.js";
import { Provider } from "web3/types";

import { DarknodeRegistryContract } from "@Bindings/darknode_registry";
import { OrderbookContract } from "@Bindings/orderbook";
import { RenExBalancesContract } from "@Bindings/ren_ex_balances";
import { RenExSettlementContract } from "@Bindings/ren_ex_settlement";
import { RenExTokensContract } from "@Bindings/ren_ex_tokens";

import { balance, usableBalance, withdraw } from "@Methods/balancesMethods";
import { deposit } from "@Methods/depositMethod";
import { transfer } from "@Methods/generalMethods";
import { cancelOrder, listOrdersByStatus, listOrdersByTrader, openOrder, Order } from "@Methods/orderbookMethods";
import { settled, status } from "@Methods/settlementMethods";

// These are temporary types to ensure that all user inputs are converted
// correctly.
export type IntInput = number | string | BN;
export type FloatInput = number | string | BigNumber;

export type IdempotentKey = string;
export type OrderID = string;
export type OrderStatus = BN; // TODO: Use enum

/**
 * This is the interface that the SDK exposes.
 *
 * @interface RenExSDK
 */
interface RenExSDK {
    address: string;
    transfer(address: string, token: number, value: IntInput): Promise<void>;
    balance(token: number): Promise<IntInput>;
    usableBalance(token: number): Promise<IntInput>;
    deposit(token: number, value: IntInput): Promise<void>;
    withdraw(token: number, value: IntInput, forced: boolean, key: IdempotentKey): Promise<IdempotentKey>;
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
    public account: string;
    public contracts: {
        renExSettlement?: RenExSettlementContract,
        renExTokens?: RenExTokensContract,
        renExBalances?: RenExBalancesContract,
        orderbook?: OrderbookContract,
        darknodeRegistry?: DarknodeRegistryContract,
    } = {};

    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, account: string) {
        this.web3 = new Web3(provider);
        this.account = account;
    }

    // tslint:disable-next-line:max-line-length
    public transfer = (addr: string, token: number, value: IntInput): Promise<void> => transfer(this, addr, token, value);
    public balance = (token: number): Promise<IntInput> => balance(this, token);
    public usableBalance = (token: number): Promise<IntInput> => usableBalance(this, token);
    public deposit = (token: number, value: IntInput): Promise<void> => deposit(this, token, value);
    // tslint:disable-next-line:max-line-length
    public withdraw = (token: number, value: IntInput, forced: boolean, key: IdempotentKey): Promise<IdempotentKey> => withdraw(this, token, value, forced, key);
    public status = (orderID: OrderID): Promise<OrderStatus> => status(this, orderID);
    public settled = (orderID: OrderID): Promise<boolean> => settled(this, orderID);
    public openOrder = (order: Order): Promise<void> => openOrder(this, order);
    public cancelOrder = (orderID: OrderID): Promise<void> => cancelOrder(this, orderID);
    public listOrdersByTrader = (addr: string): Promise<OrderID[]> => listOrdersByTrader(this, addr);
    public listOrdersByStatus = (orderStatus: OrderStatus): Promise<OrderID[]> => listOrdersByStatus(this, orderStatus);
}

export default RenExSDK;
