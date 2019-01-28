// tslint:disable

import { Transaction, TransactionReceipt, EventLog, PromiEvent } from "web3-core";
import { provider } from "web3-providers";

interface TransactionReturned { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface ERC20Contract {
    totalSupply(options?: Transaction): Promise<BigNumber>;
    balanceOf(who: string, options?: Transaction): Promise<BigNumber>;
    transfer(to: string, value: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    allowance(owner: string, spender: string, options?: Transaction): Promise<BigNumber>;
    transferFrom(from: string, to: string, value: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    approve(spender: string, value: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    address: string;
}

export interface ERC20Artifact {
    new(address: string): ERC20Contract;
    address: string;
    "new"(options?: Transaction): Promise<ERC20Contract>;
    at(address: string): Promise<ERC20Contract>;
    deployed(): Promise<ERC20Contract>;
    setProvider(provider: provider): void;
}
