import { BN } from "bn.js";
import { Log, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;

// tslint:disable:max-line-length
export interface RenExSettlementContract {
    orderStatus(index_0: string, options?: Tx): Promise<BigNumber>;
    renExTokensContract(options?: Tx): Promise<string>;
    submissionGasPriceLimit(options?: Tx): Promise<BigNumber>;
    DARKNODE_FEES_DENOMINATOR(options?: Tx): Promise<BigNumber>;
    renounceOwnership(options?: Tx): Promise<Transaction>;
    orderSubmitter(index_0: string, options?: Tx): Promise<string>;
    owner(options?: Tx): Promise<string>;
    RENEX_ATOMIC_SETTLEMENT_ID(options?: Tx): Promise<BigNumber>;
    orderDetails(index_0: string, options?: Tx): Promise<{ settlementID: BigNumber, tokens: BigNumber, price: BigNumber, volume: BigNumber, minimumVolume: BigNumber,  0: BigNumber, 1: BigNumber, 2: BigNumber, 3: BigNumber, 4: BigNumber }>;
    matchTimestamp(index_0: string, index_1: string, options?: Tx): Promise<BigNumber>;
    DARKNODE_FEES_NUMERATOR(options?: Tx): Promise<BigNumber>;
    orderbookContract(options?: Tx): Promise<string>;
    RENEX_SETTLEMENT_ID(options?: Tx): Promise<BigNumber>;
    slasherAddress(options?: Tx): Promise<string>;
    renExBalancesContract(options?: Tx): Promise<string>;
    transferOwnership(_newOwner: string, options?: Tx): Promise<Transaction>;
    VERSION(options?: Tx): Promise<string>;
    updateOrderbook(_newOrderbookContract: string, options?: Tx): Promise<Transaction>;
    updateRenExTokens(_newRenExTokensContract: string, options?: Tx): Promise<Transaction>;
    updateRenExBalances(_newRenExBalancesContract: string, options?: Tx): Promise<Transaction>;
    updateSubmissionGasPriceLimit(_newSubmissionGasPriceLimit: BigNumber, options?: Tx): Promise<Transaction>;
    updateSlasher(_newSlasherAddress: string, options?: Tx): Promise<Transaction>;
    submitOrder(_prefix: string, _settlementID: BigNumber, _tokens: BigNumber, _price: BigNumber, _volume: BigNumber, _minimumVolume: BigNumber, options?: Tx): Promise<Transaction>;
    settle(_buyID: string, _sellID: string, options?: Tx): Promise<Transaction>;
    slash(_guiltyOrderID: string, options?: Tx): Promise<Transaction>;
    getMatchDetails(_orderID: string, options?: Tx): Promise<{ settled: boolean, orderIsBuy: boolean, matchedID: string, priorityVolume: BigNumber, secondaryVolume: BigNumber, priorityFee: BigNumber, secondaryFee: BigNumber, priorityToken: BigNumber, secondaryToken: BigNumber,  0: boolean, 1: boolean, 2: string, 3: BigNumber, 4: BigNumber, 5: BigNumber, 6: BigNumber, 7: BigNumber, 8: BigNumber }>;
    hashOrder(_prefix: string, _settlementID: BigNumber, _tokens: BigNumber, _price: BigNumber, _volume: BigNumber, _minimumVolume: BigNumber, options?: Tx): Promise<string>;
    address: string;
}

export interface RenExSettlementArtifact {
    address: string;
    "new"(_VERSION: string, _orderbookContract: string, _renExTokensContract: string, _renExBalancesContract: string, _slasherAddress: string, _submissionGasPriceLimit: BigNumber, options?: Tx): Promise<RenExSettlementContract>;
    at(address: string): Promise<RenExSettlementContract>;
    deployed(): Promise<RenExSettlementContract>;
    setProvider(provider: Provider): void;
}

// tslint:enable:max-line-length