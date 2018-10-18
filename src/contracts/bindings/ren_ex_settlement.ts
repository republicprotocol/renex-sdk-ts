// tslint:disable

import { BN } from "bn.js";
import { Log, PromiEvent, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BNLike = string | number | BN;

export interface RenExSettlementContract {
    orderStatus(index_0: string, options?: Tx): Promise<BNLike>;
    renExTokensContract(options?: Tx): Promise<string>;
    submissionGasPriceLimit(options?: Tx): Promise<BNLike>;
    DARKNODE_FEES_DENOMINATOR(options?: Tx): Promise<BNLike>;
    renounceOwnership(options?: Tx): PromiEvent<Transaction>;
    orderSubmitter(index_0: string, options?: Tx): Promise<string>;
    owner(options?: Tx): Promise<string>;
    RENEX_ATOMIC_SETTLEMENT_ID(options?: Tx): Promise<BNLike>;
    orderDetails(index_0: string, options?: Tx): Promise<{ settlementID: BNLike, tokens: BNLike, price: BNLike, volume: BNLike, minimumVolume: BNLike, 0: BNLike, 1: BNLike, 2: BNLike, 3: BNLike, 4: BNLike }>;
    matchTimestamp(index_0: string, index_1: string, options?: Tx): Promise<BNLike>;
    DARKNODE_FEES_NUMERATOR(options?: Tx): Promise<BNLike>;
    orderbookContract(options?: Tx): Promise<string>;
    RENEX_SETTLEMENT_ID(options?: Tx): Promise<BNLike>;
    slasherAddress(options?: Tx): Promise<string>;
    renExBalancesContract(options?: Tx): Promise<string>;
    transferOwnership(_newOwner: string, options?: Tx): PromiEvent<Transaction>;
    VERSION(options?: Tx): Promise<string>;
    updateOrderbook(_newOrderbookContract: string, options?: Tx): PromiEvent<Transaction>;
    updateRenExTokens(_newRenExTokensContract: string, options?: Tx): PromiEvent<Transaction>;
    updateRenExBalances(_newRenExBalancesContract: string, options?: Tx): PromiEvent<Transaction>;
    updateSubmissionGasPriceLimit(_newSubmissionGasPriceLimit: BNLike, options?: Tx): PromiEvent<Transaction>;
    updateSlasher(_newSlasherAddress: string, options?: Tx): PromiEvent<Transaction>;
    submitOrder(_prefix: string, _settlementID: BNLike, _tokens: BNLike, _price: BNLike, _volume: BNLike, _minimumVolume: BNLike, options?: Tx): PromiEvent<Transaction>;
    settle(_buyID: string, _sellID: string, options?: Tx): PromiEvent<Transaction>;
    slash(_guiltyOrderID: string, options?: Tx): PromiEvent<Transaction>;
    getMatchDetails(_orderID: string, options?: Tx): Promise<{ settled: boolean, orderIsBuy: boolean, matchedID: string, priorityVolume: BNLike, secondaryVolume: BNLike, priorityFee: BNLike, secondaryFee: BNLike, priorityToken: BNLike, secondaryToken: BNLike, 0: boolean, 1: boolean, 2: string, 3: BNLike, 4: BNLike, 5: BNLike, 6: BNLike, 7: BNLike, 8: BNLike }>;
    hashOrder(_prefix: string, _settlementID: BNLike, _tokens: BNLike, _price: BNLike, _volume: BNLike, _minimumVolume: BNLike, options?: Tx): Promise<string>;
    address: string;
}

export interface RenExSettlementArtifact {
    new(address: string): RenExSettlementContract;
    address: string;
    "new"(_VERSION: string, _orderbookContract: string, _renExTokensContract: string, _renExBalancesContract: string, _slasherAddress: string, _submissionGasPriceLimit: BNLike, options?: Tx): Promise<RenExSettlementContract>;
    at(address: string): Promise<RenExSettlementContract>;
    deployed(): Promise<RenExSettlementContract>;
    setProvider(provider: Provider): void;
}
