// tslint:disable

import { BN } from "bn.js";
import { Log, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;

export interface ERC20Contract {
    totalSupply(options?: Tx): Promise<BigNumber>;
    balanceOf(who: string, options?: Tx): Promise<BigNumber>;
    transfer(to: string, value: BigNumber, options?: Tx): Promise<Transaction>;
    allowance(owner: string, spender: string, options?: Tx): Promise<BigNumber>;
    transferFrom(from: string, to: string, value: BigNumber, options?: Tx): Promise<Transaction>;
    approve(spender: string, value: BigNumber, options?: Tx): Promise<Transaction>;
    address: string;
}

export interface ERC20Artifact {
    new(address: string): ERC20Contract;
    address: string;
    "new"(options?: Tx): Promise<ERC20Contract>;
    at(address: string): Promise<ERC20Contract>;
    deployed(): Promise<ERC20Contract>;
    setProvider(provider: Provider): void;
}
