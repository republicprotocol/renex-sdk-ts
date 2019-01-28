// tslint:disable

import { Transaction, TransactionReceipt, EventLog, PromiEvent } from "web3-core";
import { provider } from "web3-providers";

interface TransactionReturned { receipt: TransactionReceipt; tx: string; logs: EventLog[]; }

type BigNumber = string;

export interface DarknodeRegistryContract {
    numDarknodesNextEpoch(options?: Transaction): Promise<BigNumber>;
    numDarknodes(options?: Transaction): Promise<BigNumber>;
    nextSlasher(options?: Transaction): Promise<string>;
    nextMinimumEpochInterval(options?: Transaction): Promise<BigNumber>;
    minimumEpochInterval(options?: Transaction): Promise<BigNumber>;
    previousEpoch(options?: Transaction): Promise<{ epochhash: BigNumber, blocknumber: BigNumber, 0: BigNumber, 1: BigNumber }>;
    nextMinimumBond(options?: Transaction): Promise<BigNumber>;
    nextMinimumPodSize(options?: Transaction): Promise<BigNumber>;
    renounceOwnership(options?: Transaction): PromiEvent<TransactionReturned>;
    numDarknodesPreviousEpoch(options?: Transaction): Promise<BigNumber>;
    currentEpoch(options?: Transaction): Promise<{ epochhash: BigNumber, blocknumber: BigNumber, 0: BigNumber, 1: BigNumber }>;
    ren(options?: Transaction): Promise<string>;
    owner(options?: Transaction): Promise<string>;
    store(options?: Transaction): Promise<string>;
    minimumBond(options?: Transaction): Promise<BigNumber>;
    slasher(options?: Transaction): Promise<string>;
    minimumPodSize(options?: Transaction): Promise<BigNumber>;
    transferOwnership(_newOwner: string, options?: Transaction): PromiEvent<TransactionReturned>;
    VERSION(options?: Transaction): Promise<string>;
    register(_darknodeID: string, _publicKey: string, _bond: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    deregister(_darknodeID: string, options?: Transaction): PromiEvent<TransactionReturned>;
    epoch(options?: Transaction): PromiEvent<TransactionReturned>;
    transferStoreOwnership(_newOwner: string, options?: Transaction): PromiEvent<TransactionReturned>;
    updateMinimumBond(_nextMinimumBond: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    updateMinimumPodSize(_nextMinimumPodSize: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    updateMinimumEpochInterval(_nextMinimumEpochInterval: BigNumber, options?: Transaction): PromiEvent<TransactionReturned>;
    updateSlasher(_slasher: string, options?: Transaction): PromiEvent<TransactionReturned>;
    slash(_prover: string, _challenger1: string, _challenger2: string, options?: Transaction): PromiEvent<TransactionReturned>;
    refund(_darknodeID: string, options?: Transaction): PromiEvent<TransactionReturned>;
    getDarknodeOwner(_darknodeID: string, options?: Transaction): Promise<string>;
    getDarknodeBond(_darknodeID: string, options?: Transaction): Promise<BigNumber>;
    getDarknodePublicKey(_darknodeID: string, options?: Transaction): Promise<string>;
    getDarknodes(_start: string, _count: BigNumber, options?: Transaction): Promise<string[]>;
    getPreviousDarknodes(_start: string, _count: BigNumber, options?: Transaction): Promise<string[]>;
    isPendingRegistration(_darknodeID: string, options?: Transaction): Promise<boolean>;
    isPendingDeregistration(_darknodeID: string, options?: Transaction): Promise<boolean>;
    isDeregistered(_darknodeID: string, options?: Transaction): Promise<boolean>;
    isDeregisterable(_darknodeID: string, options?: Transaction): Promise<boolean>;
    isRefunded(_darknodeID: string, options?: Transaction): Promise<boolean>;
    isRefundable(_darknodeID: string, options?: Transaction): Promise<boolean>;
    isRegistered(_darknodeID: string, options?: Transaction): Promise<boolean>;
    isRegisteredInPreviousEpoch(_darknodeID: string, options?: Transaction): Promise<boolean>;
    address: string;
}

export interface DarknodeRegistryArtifact {
    new(address: string): DarknodeRegistryContract;
    address: string;
    "new"(_VERSION: string, _renAddress: string, _storeAddress: string, _minimumBond: BigNumber, _minimumPodSize: BigNumber, _minimumEpochInterval: BigNumber, options?: Transaction): Promise<DarknodeRegistryContract>;
    at(address: string): Promise<DarknodeRegistryContract>;
    deployed(): Promise<DarknodeRegistryContract>;
    setProvider(provider: provider): void;
}
