import { BN } from "bn.js";
import { Log, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;

// tslint:disable:max-line-length
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
    address: string;
    "new"(options?: Tx): Promise<ERC20Contract>;
    at(address: string): Promise<ERC20Contract>;
    deployed(): Promise<ERC20Contract>;
    setProvider(provider: Provider): void;
}

// tslint:enable:max-line-length
