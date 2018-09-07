// tslint:disable

import { BN } from "bn.js";
import { Log, Provider, TransactionReceipt, Tx } from "web3/types";

export interface Transaction { receipt: TransactionReceipt; tx: string; logs: Log[]; }

type BigNumber = string | number | BN;

export interface DarknodeRegistryContract {
    numDarknodesNextEpoch(options?: Tx): Promise<BigNumber>;
    numDarknodes(options?: Tx): Promise<BigNumber>;
    nextSlasher(options?: Tx): Promise<string>;
    nextMinimumEpochInterval(options?: Tx): Promise<BigNumber>;
    minimumEpochInterval(options?: Tx): Promise<BigNumber>;
    previousEpoch(options?: Tx): Promise<{ epochhash: BigNumber, blocknumber: BigNumber,  0: BigNumber, 1: BigNumber }>;
    nextMinimumBond(options?: Tx): Promise<BigNumber>;
    nextMinimumPodSize(options?: Tx): Promise<BigNumber>;
    renounceOwnership(options?: Tx): Promise<Transaction>;
    numDarknodesPreviousEpoch(options?: Tx): Promise<BigNumber>;
    currentEpoch(options?: Tx): Promise<{ epochhash: BigNumber, blocknumber: BigNumber,  0: BigNumber, 1: BigNumber }>;
    ren(options?: Tx): Promise<string>;
    owner(options?: Tx): Promise<string>;
    store(options?: Tx): Promise<string>;
    minimumBond(options?: Tx): Promise<BigNumber>;
    slasher(options?: Tx): Promise<string>;
    minimumPodSize(options?: Tx): Promise<BigNumber>;
    transferOwnership(_newOwner: string, options?: Tx): Promise<Transaction>;
    VERSION(options?: Tx): Promise<string>;
    register(_darknodeID: string, _publicKey: string, _bond: BigNumber, options?: Tx): Promise<Transaction>;
    deregister(_darknodeID: string, options?: Tx): Promise<Transaction>;
    epoch(options?: Tx): Promise<Transaction>;
    transferStoreOwnership(_newOwner: string, options?: Tx): Promise<Transaction>;
    updateMinimumBond(_nextMinimumBond: BigNumber, options?: Tx): Promise<Transaction>;
    updateMinimumPodSize(_nextMinimumPodSize: BigNumber, options?: Tx): Promise<Transaction>;
    updateMinimumEpochInterval(_nextMinimumEpochInterval: BigNumber, options?: Tx): Promise<Transaction>;
    updateSlasher(_slasher: string, options?: Tx): Promise<Transaction>;
    slash(_prover: string, _challenger1: string, _challenger2: string, options?: Tx): Promise<Transaction>;
    refund(_darknodeID: string, options?: Tx): Promise<Transaction>;
    getDarknodeOwner(_darknodeID: string, options?: Tx): Promise<string>;
    getDarknodeBond(_darknodeID: string, options?: Tx): Promise<BigNumber>;
    getDarknodePublicKey(_darknodeID: string, options?: Tx): Promise<string>;
    getDarknodes(_start: string, _count: BigNumber, options?: Tx): Promise<string[]>;
    getPreviousDarknodes(_start: string, _count: BigNumber, options?: Tx): Promise<string[]>;
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
    "new"(_VERSION: string, _renAddress: string, _storeAddress: string, _minimumBond: BigNumber, _minimumPodSize: BigNumber, _minimumEpochInterval: BigNumber, options?: Tx): Promise<DarknodeRegistryContract>;
    at(address: string): Promise<DarknodeRegistryContract>;
    deployed(): Promise<DarknodeRegistryContract>;
    setProvider(provider: Provider): void;
}
