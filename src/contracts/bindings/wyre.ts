// tslint:disable

import { Transaction, TransactionReceipt, EventLog, PromiEvent } from "web3-core";
import { provider } from "web3-providers";

interface TransactionReturned { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface WyreContract {
    approve(_to: string, _tokenId: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    burn(_tokenId: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    mint(_to: string, _tokenId: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    takeOwnership(_tokenId: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    transfer(_to: string, _tokenld: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    approvedFor(_tokenId: BigNumber, options?: Transaction): Promise<string>;
    balanceOf(_owner: string, options?: Transaction): Promise<BigNumber>;
    ownerOf(_tokenId: BigNumber, options?: Transaction): Promise<string>;
    tokensOf(_owner: string, options?: Transaction): Promise<BigNumber[]>;
    totalSupply(options?: Transaction): Promise<BigNumber>;
    address: string;
}

export interface WyreArtifact {
    new(address: string): WyreContract;
    address: string;
    "new"(_VERSION: string, options?: Transaction): Promise<WyreContract>;
    at(address: string): Promise<WyreContract>;
    deployed(): Promise<WyreContract>;
    setProvider(provider: provider): void;
}