// tslint:disable

import { Transaction, TransactionReceipt, EventLog, PromiEvent } from "web3-core";
import { provider } from "web3-providers";

interface TransactionReturned { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface OrderbookContract {
    renounceOwnership(options?: Transaction): PromiEvent<TransactionReturned>;
    ren(options?: Transaction): Promise<string>;
    owner(options?: Transaction): Promise<string>;
    orders(index_0: string, options?: Transaction): Promise<{ state: BigNumber, trader: string, confirmer: string, settlementID: BigNumber, priority: BigNumber, blockNumber: BigNumber, matchedOrder: string, 0: BigNumber, 1: string, 2: string, 3: BigNumber, 4: BigNumber, 5: BigNumber, 6: string }>;
    darknodeRegistry(options?: Transaction): Promise<string>;
    settlementRegistry(options?: Transaction): Promise<string>;
    transferOwnership(_newOwner: string, options?: Transaction): PromiEvent<TransactionReturned>;
    VERSION(options?: Transaction): Promise<string>;
    updateDarknodeRegistry(_newDarknodeRegistry: string, options?: Transaction): PromiEvent<TransactionReturned>;
    openOrder(_settlementID: BigNumber, _signature: string, _orderID: string, options?: Transaction): PromiEvent<TransactionReturned>;
    confirmOrder(_orderID: string, _matchedOrderID: string, options?: Transaction): PromiEvent<TransactionReturned>;
    cancelOrder(_orderID: string, options?: Transaction): PromiEvent<TransactionReturned>;
    orderState(_orderID: string, options?: Transaction): Promise<BigNumber>;
    orderMatch(_orderID: string, options?: Transaction): Promise<string>;
    orderPriority(_orderID: string, options?: Transaction): Promise<BigNumber>;
    orderTrader(_orderID: string, options?: Transaction): Promise<string>;
    orderConfirmer(_orderID: string, options?: Transaction): Promise<string>;
    orderBlockNumber(_orderID: string, options?: Transaction): Promise<BigNumber>;
    orderDepth(_orderID: string, options?: Transaction): Promise<BigNumber>;
    ordersCount(options?: Transaction): Promise<BigNumber>;
    getOrders(_offset: BigNumber, _limit: BigNumber, options?: Transaction): Promise<{ 0: string[], 1: string[], 2: BigNumber[] }>;
    address: string;
}

export interface OrderbookArtifact {
    new(address: string): OrderbookContract;
    address: string;
    "new"(_VERSION: string, _renAddress: string, _darknodeRegistry: string, _settlementRegistry: string, options?: Transaction): Promise<OrderbookContract>;
    at(address: string): Promise<OrderbookContract>;
    deployed(): Promise<OrderbookContract>;
    setProvider(provider: provider): void;
}
