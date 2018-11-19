import { PromiEvent } from "web3/types";
import RenExSDK from "../index";
import { BalanceAction, IntInput, Transaction, TransactionStatus } from "../types";
export declare const getBalanceActionStatus: (sdk: RenExSDK, txHash: string) => Promise<TransactionStatus>;
export declare const onTxHash: (tx: PromiEvent<Transaction>) => Promise<{
    txHash: string;
    promiEvent: PromiEvent<Transaction>;
}>;
export declare const deposit: (sdk: RenExSDK, token: number, value: IntInput) => Promise<{
    balanceAction: BalanceAction;
    promiEvent: PromiEvent<Transaction> | null;
}>;
export declare const withdraw: (sdk: RenExSDK, token: number, value: IntInput, withoutIngressSignature: boolean) => Promise<{
    balanceAction: BalanceAction;
    promiEvent: PromiEvent<Transaction> | null;
}>;
