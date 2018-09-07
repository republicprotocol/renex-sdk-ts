// tslint:disable

import { BN } from "bn.js";
import { Log, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;

export interface RenExBalancesContract {
    brokerVerifierContract(options?: Tx): Promise<string>;
    rewardVaultContract(options?: Tx): Promise<string>;
    renounceOwnership(options?: Tx): Promise<Transaction>;
    owner(options?: Tx): Promise<string>;
    traderBalances(index_0: string, index_1: string, options?: Tx): Promise<BigNumber>;
    SIGNAL_DELAY(options?: Tx): Promise<BigNumber>;
    settlementContract(options?: Tx): Promise<string>;
    transferOwnership(_newOwner: string, options?: Tx): Promise<Transaction>;
    ETHEREUM(options?: Tx): Promise<string>;
    traderWithdrawalSignals(index_0: string, index_1: string, options?: Tx): Promise<BigNumber>;
    VERSION(options?: Tx): Promise<string>;
    updateRenExSettlementContract(_newSettlementContract: string, options?: Tx): Promise<Transaction>;
    updateRewardVaultContract(_newRewardVaultContract: string, options?: Tx): Promise<Transaction>;
    updateBrokerVerifierContract(_newBrokerVerifierContract: string, options?: Tx): Promise<Transaction>;
    transferBalanceWithFee(_traderFrom: string, _traderTo: string, _token: string, _value: BigNumber, _fee: BigNumber, _feePayee: string, options?: Tx): Promise<Transaction>;
    deposit(_token: string, _value: BigNumber, options?: Tx): Promise<Transaction>;
    withdraw(_token: string, _value: BigNumber, _signature: string, options?: Tx): Promise<Transaction>;
    signalBackupWithdraw(_token: string, options?: Tx): Promise<Transaction>;
    address: string;
}

export interface RenExBalancesArtifact {
    new(address: string): RenExBalancesContract;
    address: string;
    "new"(_VERSION: string, _rewardVaultContract: string, _brokerVerifierContract: string, options?: Tx): Promise<RenExBalancesContract>;
    at(address: string): Promise<RenExBalancesContract>;
    deployed(): Promise<RenExBalancesContract>;
    setProvider(provider: Provider): void;
}
