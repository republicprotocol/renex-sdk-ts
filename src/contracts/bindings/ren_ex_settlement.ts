// tslint:disable

import { Transaction, TransactionReceipt, EventLog, PromiEvent } from "web3-core";
import { provider } from "web3-providers";

interface TransactionReturned { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface RenExSettlementContract {
    orderStatus(index_0: string, options?: Transaction): Promise<BigNumber>;
    renExTokensContract(options?: Transaction): Promise<string>;
    submissionGasPriceLimit(options?: Transaction): Promise<BigNumber>;
    DARKNODE_FEES_DENOMINATOR(options?: Transaction): Promise<BigNumber>;
    renounceOwnership(options?: Transaction): PromiEvent<TransactionReturned>;
    orderSubmitter(index_0: string, options?: Transaction): Promise<string>;
    owner(options?: Transaction): Promise<string>;
    RENEX_ATOMIC_SETTLEMENT_ID(options?: Transaction): Promise<BigNumber>;
    orderDetails(index_0: string, options?: Transaction): Promise<{ settlementID: BigNumber, tokens: BigNumber, price: BigNumber, volume: BigNumber, minimumVolume: BigNumber, 0: BigNumber, 1: BigNumber, 2: BigNumber, 3: BigNumber, 4: BigNumber }>;
    matchTimestamp(index_0: string, index_1: string, options?: Transaction): Promise<BigNumber>;
    DARKNODE_FEES_NUMERATOR(options?: Transaction): Promise<BigNumber>;
    orderbookContract(options?: Transaction): Promise<string>;
    RENEX_SETTLEMENT_ID(options?: Transaction): Promise<BigNumber>;
    slasherAddress(options?: Transaction): Promise<string>;
    renExBalancesContract(options?: Transaction): Promise<string>;
    transferOwnership(_newOwner: string, options?: Transaction): PromiEvent<TransactionReturned>;
    VERSION(options?: Transaction): Promise<string>;
    updateOrderbook(_newOrderbookContract: string, options?: Transaction): PromiEvent<TransactionReturned>;
    updateRenExTokens(_newRenExTokensContract: string, options?: Transaction): PromiEvent<TransactionReturned>;
    updateRenExBalances(_newRenExBalancesContract: string, options?: Transaction): PromiEvent<TransactionReturned>;
    updateSubmissionGasPriceLimit(_newSubmissionGasPriceLimit: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    updateSlasher(_newSlasherAddress: string, options?: Transaction): PromiEvent<TransactionReturned>;
    submitOrder(_prefix: string, _settlementID: BigNumber, _tokens: BigNumber, _price: BigNumber, _volume: BigNumber, _minimumVolume: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    settle(_buyID: string, _sellID: string, options?: Transaction): PromiEvent<TransactionReturned>;
    slash(_guiltyOrderID: string, options?: Transaction): PromiEvent<TransactionReturned>;
    getMatchDetails(_orderID: string, options?: Transaction): Promise<{ settled: boolean, orderIsBuy: boolean, matchedID: string, priorityVolume: BigNumber, secondaryVolume: BigNumber, priorityFee: BigNumber, secondaryFee: BigNumber, priorityToken: BigNumber, secondaryToken: BigNumber, 0: boolean, 1: boolean, 2: string, 3: BigNumber, 4: BigNumber, 5: BigNumber, 6: BigNumber, 7: BigNumber, 8: BigNumber }>;
    hashOrder(_prefix: string, _settlementID: BigNumber, _tokens: BigNumber, _price: BigNumber, _volume: BigNumber, _minimumVolume: BigNumber, options?: Transaction): Promise<string>;
    address: string;
}

export interface RenExSettlementArtifact {
    new(address: string): RenExSettlementContract;
    address: string;
    "new"(_VERSION: string, _orderbookContract: string, _renExTokensContract: string, _renExBalancesContract: string, _slasherAddress: string, _submissionGasPriceLimit: BigNumber, options?: Transaction): Promise<RenExSettlementContract>;
    at(address: string): Promise<RenExSettlementContract>;
    deployed(): Promise<RenExSettlementContract>;
    setProvider(provider: provider): void;
}
