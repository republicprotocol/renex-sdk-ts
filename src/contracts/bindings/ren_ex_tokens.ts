// tslint:disable

import BN from "bn.js";
import { Tx } from "web3/eth/types";
import { Provider } from "web3/providers";
import PromiEvent from "web3/promiEvent";
import { TransactionReceipt, EventLog } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface RenExTokensContract {
    renounceOwnership(options?: Tx): PromiEvent<Transaction>;
    owner(options?: Tx): Promise<string>;
    transferOwnership(_newOwner: string, options?: Tx): PromiEvent<Transaction>;
    tokens(index_0: number | BigNumber, options?: Tx): Promise<{ addr: string, decimals: BigNumber, registered: boolean, 0: string, 1: BigNumber, 2: boolean }>;
    VERSION(options?: Tx): Promise<string>;
    registerToken(_tokenCode: number | BigNumber, _tokenAddress: string, _tokenDecimals: number | BigNumber, options?: Tx): PromiEvent<Transaction>;
    deregisterToken(_tokenCode: number | BigNumber, options?: Tx): PromiEvent<Transaction>;
    address: string;
}

export interface RenExTokensArtifact {
    new(address: string): RenExTokensContract;
    address: string;
    "new"(_VERSION: string, options?: Tx): Promise<RenExTokensContract>;
    at(address: string): Promise<RenExTokensContract>;
    deployed(): Promise<RenExTokensContract>;
    setProvider(provider: Provider): void;
}
