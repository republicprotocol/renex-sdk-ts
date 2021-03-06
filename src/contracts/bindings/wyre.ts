// tslint:disable

import { Tx } from "web3/eth/types";
import { Provider } from "web3/providers";
import PromiEvent from "web3/promiEvent";
import { TransactionReceipt, EventLog } from "web3/types";

interface Transaction { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface WyreContract {
    approve(_to: string, _tokenId: BigNumber, options?: Tx): PromiEvent<Transaction>;
    burn(_tokenId: BigNumber, options?: Tx): PromiEvent<Transaction>;
    mint(_to: string, _tokenId: BigNumber, options?: Tx): PromiEvent<Transaction>;
    takeOwnership(_tokenId: BigNumber, options?: Tx): PromiEvent<Transaction>;
    transfer(_to: string, _tokenld: BigNumber, options?: Tx): PromiEvent<Transaction>;
    approvedFor(_tokenId: BigNumber, options?: Tx): Promise<string>;
    balanceOf(_owner: string, options?: Tx): Promise<BigNumber>;
    ownerOf(_tokenId: BigNumber, options?: Tx): Promise<string>;
    tokensOf(_owner: string, options?: Tx): Promise<BigNumber[]>;
    totalSupply(options?: Tx): Promise<BigNumber>;
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