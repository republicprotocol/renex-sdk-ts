import BigNumber from "bignumber.js";
import Web3 from "web3";

import { BN } from "bn.js";
import { Provider } from "web3/types";

import LocalStorage from "./storage/localStorage";

import { DarknodeRegistryContract } from "./contracts/bindings/darknode_registry";
import { ERC20Contract } from "./contracts/bindings/erc20";
import { OrderbookContract } from "./contracts/bindings/orderbook";
import { RenExBalancesContract } from "./contracts/bindings/ren_ex_balances";
import { RenExSettlementContract } from "./contracts/bindings/ren_ex_settlement";
import { RenExTokensContract } from "./contracts/bindings/ren_ex_tokens";

import { DarknodeRegistry, Orderbook, RenExBalances, RenExSettlement, RenExTokens, withProvider } from "./contracts/contracts";
import { OrderParity, OrderType } from "./lib/ingress";
import { OrderSettlement } from "./lib/market";
import { NetworkData } from "./lib/network";
import { Token } from "./lib/tokens";
import { deposit, getBalanceActionStatus, withdraw } from "./methods/balanceActionMethods";
import { balance, balances, nondepositedBalance, nondepositedBalances, tokenDetails, usableBalance, usableBalances } from "./methods/balancesMethods";
import { transfer } from "./methods/generalMethods";
import { cancelOrder, getOrders, openOrder } from "./methods/orderbookMethods";
import { matchDetails, status } from "./methods/settlementMethods";
import { Storage } from "./storage/interface";
import { MemoryStorage } from "./storage/memoryStorage";

// These are temporary types to ensure that all user inputs are converted
// correctly.
export type IntInput = number | string | BN;
export type FloatInput = number | string | BigNumber;

export interface Transaction { receipt: any; tx: string; logs: any[]; }

export type IdempotentKey = string;
export type OrderID = string;
export enum OrderStatus {
    NOT_SUBMITTED = "not submitted",
    FAILED_TO_OPEN = "failed to open",
    OPEN = "open",
    CONFIRMED = "confirmed",
    CANCELED = "canceled",
    SETTLED = "settled",
    SLASHED = "slashed",
    EXPIRED = "expired",
}

export { OrderSettlement } from "./lib/market";

export { OrderParity, OrderType } from "./lib/ingress";

export { NetworkData } from "./lib/network";

export interface OrderInputs {
    // Required fields
    spendToken: number;
    receiveToken: number;
    price: FloatInput;
    volume: IntInput;
    minimumVolume: IntInput;

    // Optional fields
    type?: OrderInputsAll["type"];
    orderSettlement?: OrderInputsAll["orderSettlement"];
    nonce?: OrderInputsAll["nonce"];
    expiry?: OrderInputsAll["expiry"];
}

// OrderInputsAll extends OrderInputs and sets optional fields to be required.
export interface OrderInputsAll extends OrderInputs {
    // Restrict type
    price: BigNumber;
    volume: BN;
    minimumVolume: BN;

    // Change to non-optional
    type: OrderType;
    orderSettlement: OrderSettlement;
    nonce: BN;
    expiry: number;
}

export interface ComputedOrderDetails {
    receiveVolume: BN;
    spendVolume: BN;
    date: number;
    parity: OrderParity;
}

export interface Order {
    readonly id: OrderID;
    readonly trader: string;
    status: OrderStatus;
    matchDetails?: MatchDetails;
}

// If TraderOrder, then it's serialize / deserialize functions should be
// updated as well.
export interface TraderOrder extends Order {
    readonly computedOrderDetails: ComputedOrderDetails;
    readonly orderInputs: OrderInputsAll;
    readonly transactionHash: string;
}

export interface GetOrdersFilter {
    address?: string;
    status?: OrderStatus;
    limit?: number;
    start?: number;
}

export interface MatchDetails {
    orderID: string;
    matchedID: string;

    receivedVolume: BN;
    spentVolume: BN;
    fee: BN;
    receivedToken: number;
    spentToken: number;
}

export interface TokenDetails {
    address: string;
    decimals: number;
    registered: boolean;
}

export enum BalanceActionType {
    Withdraw = "withdraw",
    Deposit = "deposit",
}

export enum BalanceActionStatus {
    Pending = "pending",
    Done = "done",
    Failed = "failed"
}

// If BalanceAction, then it's serialize / deserialize functions should be
// updated as well.
export interface BalanceAction {
    action: BalanceActionType;
    amount: BN;
    time: number;
    status: BalanceActionStatus;
    token: number;
    trader: string;
    txHash: string;
}

/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class IRenExSDK
 */
class RenExSDK {
    public web3: Web3;
    public address: string;
    public networkData: NetworkData;
    // TODO: Make it possible to loop through all tokens (without the reverse lookup duplicates)
    public tokens = Token;
    public orderStatus = OrderStatus;
    public storage: Storage;
    public contracts: {
        renExSettlement: RenExSettlementContract,
        renExTokens: RenExTokensContract,
        renExBalances: RenExBalancesContract,
        orderbook: OrderbookContract,
        darknodeRegistry: DarknodeRegistryContract,
        erc20: Map<number, ERC20Contract>,
    };
    public cachedTokenDetails: Map<number, TokenDetails> = new Map();

    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, networkData: NetworkData, address: string) {
        this.web3 = new Web3(provider);
        this.networkData = networkData;
        this.address = address;

        if (address) {
            this.storage = new LocalStorage(address);
        } else {
            this.storage = new MemoryStorage();
        }

        this.contracts = {
            renExSettlement: new (withProvider(this.web3, RenExSettlement))(networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.web3, RenExBalances))(networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.web3, Orderbook))(networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(this.web3, DarknodeRegistry))(networkData.contracts[0].darknodeRegistry),
            renExTokens: new (withProvider(this.web3, RenExTokens))(networkData.contracts[0].renExTokens),
            erc20: new Map<number, ERC20Contract>(),
        };
    }

    // tslint:disable-next-line:max-line-length
    public tokenDetails = (token: number): Promise<TokenDetails> => tokenDetails(this, token);
    public transfer = (addr: string, token: number, value: IntInput): Promise<void> => transfer(this, addr, token, value);
    public nondepositedBalance = (token: number): Promise<BN> => nondepositedBalance(this, token);
    public nondepositedBalances = (tokens: number[]): Promise<BN[]> => nondepositedBalances(this, tokens);
    public balance = (token: number): Promise<BN> => balance(this, token);
    public balances = (tokens: number[]): Promise<BN[]> => balances(this, tokens);
    public usableBalance = (token: number): Promise<BN> => usableBalance(this, token);
    public usableBalances = (tokens: number[]): Promise<BN[]> => usableBalances(this, tokens);
    public getBalanceActionStatus = (txHash: string): Promise<BalanceActionStatus> => getBalanceActionStatus(this, txHash);
    public deposit = (token: number, value: IntInput): Promise<BalanceAction> => deposit(this, token, value);
    public withdraw = (token: number, value: IntInput, withoutIngressSignature?: boolean, key?: IdempotentKey): Promise<BalanceAction> =>
        withdraw(this, token, value, withoutIngressSignature, key)
    public status = (orderID: OrderID): Promise<OrderStatus> => status(this, orderID);
    public matchDetails = (orderID: OrderID): Promise<MatchDetails> => matchDetails(this, orderID);
    public openOrder = (order: OrderInputs): Promise<Order> => openOrder(this, order);
    public cancelOrder = (orderID: OrderID): Promise<void> => cancelOrder(this, orderID);
    public getOrders = (filter: GetOrdersFilter): Promise<Order[]> => getOrders(this, filter);

    public listTraderOrders = async (): Promise<TraderOrder[]> =>
        this.storage
            .getOrders()
            .then(orders => orders.sort((a, b) => a.computedOrderDetails.date < b.computedOrderDetails.date ? -1 : 1))

    public listBalanceActions = (): Promise<BalanceAction[]> =>
        this.storage
            .getBalanceActions()
            .then(actions => actions.sort((a, b) => a.time < b.time ? -1 : 1))

    public updateProvider(provider: Provider): void {
        this.web3 = new Web3(provider);

        // Update contract providers
        this.contracts = {
            renExSettlement: new (withProvider(this.web3, RenExSettlement))(this.networkData.contracts[0].renExSettlement),
            renExBalances: new (withProvider(this.web3, RenExBalances))(this.networkData.contracts[0].renExBalances),
            orderbook: new (withProvider(this.web3, Orderbook))(this.networkData.contracts[0].orderbook),
            darknodeRegistry: new (withProvider(this.web3, DarknodeRegistry))(this.networkData.contracts[0].darknodeRegistry),
            renExTokens: new (withProvider(this.web3, RenExTokens))(this.networkData.contracts[0].renExTokens),
            erc20: new Map<number, ERC20Contract>(),
        };
    }

    public updateAddress(address: string): void {
        this.address = address;

        this.storage = new LocalStorage(address);
    }
}

export default RenExSDK;
