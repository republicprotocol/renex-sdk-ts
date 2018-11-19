import { BN } from "bn.js";
import { Log, TransactionReceipt, Tx } from "web3/types";
export interface Transaction {
    receipt: TransactionReceipt;
    tx: string;
    logs: Log[];
}
declare type BigNumber = string | number | BN;
export interface RenExAtomicInfoContract {
    getOwnerAddress(index_0: string, options?: Tx): Promise<string>;
    ownerAddressTimestamp(index_0: string, options?: Tx): Promise<BigNumber>;
    swapDetailsTimestamp(index_0: string, options?: Tx): Promise<BigNumber>;
    renounceOwnership(options?: Tx): Promise<Transaction>;
    owner(options?: Tx): Promise<string>;
    swapDetails(index_0: string, options?: Tx): Promise<string>;
    orderbookContract(options?: Tx): Promise<string>;
    transferOwnership(_newOwner: string, options?: Tx): Promise<Transaction>;
    authorizedSwapper(index_0: string, index_1: string, options?: Tx): Promise<boolean>;
    VERSION(options?: Tx): Promise<string>;
    updateOrderbook(_newOrderbookContract: string, options?: Tx): Promise<Transaction>;
    authorizeSwapper(_swapper: string, options?: Tx): Promise<Transaction>;
    deauthorizeSwapper(_swapper: string, options?: Tx): Promise<Transaction>;
    submitDetails(_orderID: string, _swapDetails: string, options?: Tx): Promise<Transaction>;
    setOwnerAddress(_orderID: string, _owner: string, options?: Tx): Promise<Transaction>;
    address: string;
}
export interface RenExAtomicInfoArtifact {
    address: string;
    "new"(_VERSION: string, _orderbookContract: string, options?: Tx): Promise<RenExAtomicInfoContract>;
    at(address: string): Promise<RenExAtomicInfoContract>;
    deployed(): Promise<RenExAtomicInfoContract>;
}
export {};
