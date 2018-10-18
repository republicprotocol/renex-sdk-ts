// tslint:disable

import { BN } from "bn.js";
import { Log, PromiEvent, TransactionReceipt, Tx, Provider } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BNLike = string | number | BN;

export interface WyreContract {
    approve(_to: string, _tokenId: BNLike, options?: Tx): PromiEvent<Transaction>;
    burn(_tokenId: BNLike, options?: Tx): PromiEvent<Transaction>;
    mint(_to: string, _tokenId: BNLike, options?: Tx): PromiEvent<Transaction>;
    takeOwnership(_tokenId: BNLike, options?: Tx): PromiEvent<Transaction>;
    transfer(_to: string, _tokenld: BNLike, options?: Tx): PromiEvent<Transaction>;
    approvedFor(_tokenId: BNLike, options?: Tx): Promise<string>;
    balanceOf(_owner: string, options?: Tx): Promise<BNLike>;
    ownerOf(_tokenId: BNLike, options?: Tx): Promise<string>;
    tokensOf(_owner: string, options?: Tx): Promise<BNLike[]>;
    totalSupply(options?: Tx): Promise<BNLike>;
    address: string;
}

export interface WyreArtifact {
    new(address: string): WyreContract;
    address: string;
    "new"(_VERSION: string, options?: Tx): Promise<WyreContract>;
    at(address: string): Promise<WyreContract>;
    deployed(): Promise<WyreContract>;
    setProvider(provider: Provider): void;
}