// tslint:disable

import { Transaction, TransactionReceipt, EventLog, PromiEvent } from "web3-core";
import { provider } from "web3-providers";

interface TransactionReturned { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface RenExTokensContract {
    renounceOwnership(options?: Transaction): PromiEvent<TransactionReturned>;
    owner(options?: Transaction): Promise<string>;
    transferOwnership(_newOwner: string, options?: Transaction): PromiEvent<TransactionReturned>;
    tokens(index_0: number | BigNumber, options?: Transaction): Promise<{ addr: string, decimals: BigNumber, registered: boolean, 0: string, 1: BigNumber, 2: boolean }>;
    VERSION(options?: Transaction): Promise<string>;
    registerToken(_tokenCode: number | BigNumber, _tokenAddress: string, _tokenDecimals: number | BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    deregisterToken(_tokenCode: number | BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    address: string;
}

export interface RenExTokensArtifact {
    new(address: string): RenExTokensContract;
    address: string;
    "new"(_VERSION: string, options?: Transaction): Promise<RenExTokensContract>;
    at(address: string): Promise<RenExTokensContract>;
    deployed(): Promise<RenExTokensContract>;
    setProvider(provider: provider): void;
}
