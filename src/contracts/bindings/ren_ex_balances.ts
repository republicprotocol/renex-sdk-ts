// tslint:disable

import { Transaction, TransactionReceipt, EventLog, PromiEvent } from "web3-core";
import { provider } from "web3-providers";

interface TransactionReturned { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface RenExBalancesContract {
    brokerVerifierContract(options?: Transaction): Promise<string>;
    rewardVaultContract(options?: Transaction): Promise<string>;
    renounceOwnership(options?: Transaction): PromiEvent<TransactionReturned>;
    owner(options?: Transaction): Promise<string>;
    traderBalances(index_0: string, index_1: string, options?: Transaction): Promise<BigNumber>;
    SIGNAL_DELAY(options?: Transaction): Promise<BigNumber>;
    settlementContract(options?: Transaction): Promise<string>;
    transferOwnership(_newOwner: string, options?: Transaction): PromiEvent<TransactionReturned>;
    ETHEREUM(options?: Transaction): Promise<string>;
    traderWithdrawalSignals(index_0: string, index_1: string, options?: Transaction): Promise<BigNumber>;
    VERSION(options?: Transaction): Promise<string>;
    updateRenExSettlementContract(_newSettlementContract: string, options?: Transaction): PromiEvent<TransactionReturned>;
    updateRewardVaultContract(_newRewardVaultContract: string, options?: Transaction): PromiEvent<TransactionReturned>;
    updateBrokerVerifierContract(_newBrokerVerifierContract: string, options?: Transaction): PromiEvent<TransactionReturned>;
    transferBalanceWithFee(_traderFrom: string, _traderTo: string, _token: string, _value: BigNumber, _fee: BigNumber, _feePayee: string, options?: Transaction): PromiEvent<TransactionReturned>;
    deposit(_token: string, _value: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    withdraw(_token: string, _value: BigNumber, _signature: string, options?: Transaction): PromiEvent<TransactionReturned>;
    signalBackupWithdraw(_token: string, options?: Transaction): PromiEvent<TransactionReturned>;
    address: string;
}

export interface RenExBalancesArtifact {
    new(address: string): RenExBalancesContract;
    address: string;
    "new"(_VERSION: string, _rewardVaultContract: string, _brokerVerifierContract: string, options?: Transaction): Promise<RenExBalancesContract>;
    at(address: string): Promise<RenExBalancesContract>;
    deployed(): Promise<RenExBalancesContract>;
    setProvider(provider: provider): void;
}
