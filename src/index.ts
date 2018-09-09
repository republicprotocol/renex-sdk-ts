import BigNumber from "bignumber.js";
import Web3 from "web3";

import { BN } from "bn.js";
import { Provider } from "web3/types";

import { DarknodeRegistryContract } from "./contracts/bindings/darknode_registry";
import { ERC20Contract } from "./contracts/bindings/erc20";
import { OrderbookContract } from "./contracts/bindings/orderbook";
import { RenExBalancesContract } from "./contracts/bindings/ren_ex_balances";
import { RenExSettlementContract } from "./contracts/bindings/ren_ex_settlement";
import { RenExTokensContract } from "./contracts/bindings/ren_ex_tokens";

import { DarknodeRegistry, Orderbook, RenExBalances, RenExSettlement, RenExTokens, withProvider } from "./contracts/contracts";
import { OrderSettlement } from "./lib/market";
import { NetworkData } from "./lib/network";
import { Token } from "./lib/tokens";
import { balance, balances, nondepositedBalance, nondepositedBalances, usableBalance, usableBalances, withdraw } from "./methods/balancesMethods";
import { deposit } from "./methods/depositMethod";
import { transfer } from "./methods/generalMethods";
import { cancelOrder, listOrders, openOrder, verifyOrder } from "./methods/orderbookMethods";
import { settled, status } from "./methods/settlementMethods";

// These are temporary types to ensure that all user inputs are converted
// correctly.
export type IntInput = number | string | BN;
export type FloatInput = number | string | BigNumber;

export interface Transaction { receipt: any; tx: string; logs: any[]; }

export type IdempotentKey = string;
export type OrderID = string;
export enum OrderStatus {
    NOT_SUBMITTED = "not submitted",
    OPEN = "open",
    CONFIRMED = "confirmed",
    CANCELED = "canceled",
    SETTLED = "settled",
    SLASHED = "slashed",
}

export { OrderSettlement } from "./lib/market";

export interface Order {
    sellToken: number;
    buyToken: number;
    price: FloatInput;
    volume: IntInput;
    minimumVolume: IntInput;
    orderSettlement?: OrderSettlement;
    nonce?: BN;
    id?: string;
    expiry?: number;
}

export interface HiddenOrder {
    orderID: string;
    status: OrderStatus;
    trader: string;
}

export interface ListOrdersFilter {
    address?: string;
    status?: OrderStatus;
    limit?: number;
    start?: number;
}

/**
 * This is the interface that the SDK exposes.
 *
 * @interface RenExSDK
 */
interface RenExSDK {
    address: string;
    transfer(address: string, token: number, value: IntInput): Promise<void>;
    balance(token: number): Promise<BN>;
    balances(tokens: number[]): Promise<BN[]>;
    nondepositedBalance(token: number): Promise<BN>;
    usableBalance(token: number): Promise<BN>;
    deposit(token: number, value: IntInput): Promise<Transaction>;
    withdraw(token: number, value: IntInput, withoutIngressSignature?: boolean, key?: IdempotentKey): Promise<IdempotentKey | void>;
    status(orderID: OrderID): Promise<OrderStatus>;
    settled(orderID: OrderID): Promise<boolean>;
    verifyOrder(order: Order): Promise<Order>;
    openOrder(order: Order): Promise<void>;
    cancelOrder(orderID: OrderID): Promise<void>;
    listOrders(filter: ListOrdersFilter): Promise<HiddenOrder[]>;
}

/**
 * This is the concrete class that implements the RenExSDK interface.
 *
 * @class RenExSDK
 * @implements {RenExSDK}
 */
class RenExSDK implements RenExSDK {
    public web3: Web3;
    public address: string;
    // TODO: Make it possible to loop through all tokens (without the reverse lookup duplicates)
    public tokens = Token;
    public orderStatus = OrderStatus;
    public contracts: {
        renExSettlement?: RenExSettlementContract,
        renExTokens?: RenExTokensContract,
        renExBalances?: RenExBalancesContract,
        orderbook?: OrderbookContract,
        darknodeRegistry?: DarknodeRegistryContract,
        erc20: Map<number, ERC20Contract>,
    } = {
            erc20: new Map<number, ERC20Contract>()
        };

    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, address: string) {
        if (address === null) {
            throw new Error("invalid address");
        }
        this.web3 = new Web3(provider);
        this.address = address;

        this.contracts.renExSettlement = new (withProvider(this.web3, RenExSettlement))(NetworkData.contracts[0].renExTokens);
        this.contracts.renExBalances = new (withProvider(this.web3, RenExBalances))(NetworkData.contracts[0].renExBalances);
        this.contracts.orderbook = new (withProvider(this.web3, Orderbook))(NetworkData.contracts[0].orderbook);
        this.contracts.darknodeRegistry = new (withProvider(this.web3, DarknodeRegistry))(NetworkData.contracts[0].darknodeRegistry);
        this.contracts.renExTokens = new (withProvider(this.web3, RenExTokens))(NetworkData.contracts[0].renExTokens);
    }

    // tslint:disable-next-line:max-line-length
    public transfer = (addr: string, token: number, value: IntInput): Promise<void> => transfer(this, addr, token, value);
    public nondepositedBalance = (token: number): Promise<BN> => nondepositedBalance(this, token);
    public nondepositedBalances = (tokens: number[]): Promise<BN[]> => nondepositedBalances(this, tokens);
    public balance = (token: number): Promise<BN> => balance(this, token);
    public balances = (tokens: number[]): Promise<BN[]> => balances(this, tokens);
    public usableBalance = (token: number): Promise<BN> => usableBalance(this, token);
    public usableBalances = (tokens: number[]): Promise<BN[]> => usableBalances(this, tokens);
    public deposit = (token: number, value: IntInput): Promise<Transaction> => deposit(this, token, value);
    // tslint:disable-next-line:max-line-length
    public withdraw = (token: number, value: IntInput, withoutIngressSignature?: boolean, key?: IdempotentKey): Promise<IdempotentKey | void> => withdraw(this, token, value, withoutIngressSignature, key);
    public status = (orderID: OrderID): Promise<OrderStatus> => status(this, orderID);
    public settled = (orderID: OrderID): Promise<boolean> => settled(this, orderID);
    public verifyOrder = (order: Order): Promise<Order> => verifyOrder(this, order);
    public openOrder = (order: Order): Promise<void> => openOrder(this, order);
    public cancelOrder = (orderID: OrderID): Promise<void> => cancelOrder(this, orderID);
    public listOrders = (filter: ListOrdersFilter): Promise<HiddenOrder[]> => listOrders(this, filter);

    public updateProvider(provider: Provider): void {
        this.web3 = new Web3(provider);
    }
    public updateAddress(address: string): void {
        this.address = address;
    }
}

export default RenExSDK;
