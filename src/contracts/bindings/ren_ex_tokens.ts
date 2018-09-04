import { BN } from "bn.js";
import { Log, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;

// tslint:disable:max-line-length
export interface RenExTokensContract {
    renounceOwnership(options?: Tx): Promise<Transaction>;
    owner(options?: Tx): Promise<string>;
    transferOwnership(_newOwner: string, options?: Tx): Promise<Transaction>;
    tokens(index_0: number|BigNumber, options?: Tx): Promise<{ addr: string, decimals: BigNumber, registered: boolean,  0: string, 1: BigNumber, 2: boolean }>;
    VERSION(options?: Tx): Promise<string>;
    registerToken(_tokenCode: number|BigNumber, _tokenAddress: string, _tokenDecimals: number|BigNumber, options?: Tx): Promise<Transaction>;
    deregisterToken(_tokenCode: number|BigNumber, options?: Tx): Promise<Transaction>;
    address: string;
}

export interface RenExTokensArtifact {
    address: string;
    "new"(_VERSION: string, options?: Tx): Promise<RenExTokensContract>;
    at(address: string): Promise<RenExTokensContract>;
    deployed(): Promise<RenExTokensContract>;
    setProvider(provider: Provider): void;
}

// tslint:enable:max-line-length
