// tslint:disable

import { BN } from "bn.js";
import { Log, PromiEvent, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BNLike = string | number | BN;

export interface DarknodeRegistryContract {
    numDarknodesNextEpoch(options?: Tx): Promise<BNLike>;
    numDarknodes(options?: Tx): Promise<BNLike>;
    nextSlasher(options?: Tx): Promise<string>;
    nextMinimumEpochInterval(options?: Tx): Promise<BNLike>;
    minimumEpochInterval(options?: Tx): Promise<BNLike>;
    previousEpoch(options?: Tx): Promise<{ epochhash: BNLike, blocknumber: BNLike, 0: BNLike, 1: BNLike }>;
    nextMinimumBond(options?: Tx): Promise<BNLike>;
    nextMinimumPodSize(options?: Tx): Promise<BNLike>;
    renounceOwnership(options?: Tx): PromiEvent<Transaction>;
    numDarknodesPreviousEpoch(options?: Tx): Promise<BNLike>;
    currentEpoch(options?: Tx): Promise<{ epochhash: BNLike, blocknumber: BNLike, 0: BNLike, 1: BNLike }>;
    ren(options?: Tx): Promise<string>;
    owner(options?: Tx): Promise<string>;
    store(options?: Tx): Promise<string>;
    minimumBond(options?: Tx): Promise<BNLike>;
    slasher(options?: Tx): Promise<string>;
    minimumPodSize(options?: Tx): Promise<BNLike>;
    transferOwnership(_newOwner: string, options?: Tx): PromiEvent<Transaction>;
    VERSION(options?: Tx): Promise<string>;
    register(_darknodeID: string, _publicKey: string, _bond: BNLike, options?: Tx): PromiEvent<Transaction>;
    deregister(_darknodeID: string, options?: Tx): PromiEvent<Transaction>;
    epoch(options?: Tx): PromiEvent<Transaction>;
    transferStoreOwnership(_newOwner: string, options?: Tx): PromiEvent<Transaction>;
    updateMinimumBond(_nextMinimumBond: BNLike, options?: Tx): PromiEvent<Transaction>;
    updateMinimumPodSize(_nextMinimumPodSize: BNLike, options?: Tx): PromiEvent<Transaction>;
    updateMinimumEpochInterval(_nextMinimumEpochInterval: BNLike, options?: Tx): PromiEvent<Transaction>;
    updateSlasher(_slasher: string, options?: Tx): PromiEvent<Transaction>;
    slash(_prover: string, _challenger1: string, _challenger2: string, options?: Tx): PromiEvent<Transaction>;
    refund(_darknodeID: string, options?: Tx): PromiEvent<Transaction>;
    getDarknodeOwner(_darknodeID: string, options?: Tx): Promise<string>;
    getDarknodeBond(_darknodeID: string, options?: Tx): Promise<BNLike>;
    getDarknodePublicKey(_darknodeID: string, options?: Tx): Promise<string>;
    getDarknodes(_start: string, _count: BNLike, options?: Tx): Promise<string[]>;
    getPreviousDarknodes(_start: string, _count: BNLike, options?: Tx): Promise<string[]>;
    isPendingRegistration(_darknodeID: string, options?: Tx): Promise<boolean>;
    isPendingDeregistration(_darknodeID: string, options?: Tx): Promise<boolean>;
    isDeregistered(_darknodeID: string, options?: Tx): Promise<boolean>;
    isDeregisterable(_darknodeID: string, options?: Tx): Promise<boolean>;
    isRefunded(_darknodeID: string, options?: Tx): Promise<boolean>;
    isRefundable(_darknodeID: string, options?: Tx): Promise<boolean>;
    isRegistered(_darknodeID: string, options?: Tx): Promise<boolean>;
    isRegisteredInPreviousEpoch(_darknodeID: string, options?: Tx): Promise<boolean>;
    address: string;
}

export interface DarknodeRegistryArtifact {
    new(address: string): DarknodeRegistryContract;
    address: string;
    "new"(_VERSION: string, _renAddress: string, _storeAddress: string, _minimumBond: BNLike, _minimumPodSize: BNLike, _minimumEpochInterval: BNLike, options?: Tx): Promise<DarknodeRegistryContract>;
    at(address: string): Promise<DarknodeRegistryContract>;
    deployed(): Promise<DarknodeRegistryContract>;
    setProvider(provider: Provider): void;
}
