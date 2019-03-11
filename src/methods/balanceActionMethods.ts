import PromiEvent from "web3/promiEvent";

import RenExSDK from "../index";
import { BalanceAction, Transaction, TransactionStatus } from "../types";

import { getTransactionStatus } from "./generalMethods";
import { fetchBalanceActions } from "./storageMethods";

export const updateBalanceActionStatus = async (sdk: RenExSDK, txHash: string): Promise<TransactionStatus> => {
    const balanceActionStatus: TransactionStatus = await getTransactionStatus(sdk, txHash);

    // Update local storage (without awaiting)
    sdk._storage.getBalanceAction(txHash).then(async (balanceAction: BalanceAction | undefined) => {
        if (balanceAction) {
            balanceAction.status = balanceActionStatus;
            await sdk._storage.setBalanceAction(balanceAction);
        }
    }).catch(console.error);

    return balanceActionStatus;
};

export const updateAllBalanceActionStatuses = async (sdk: RenExSDK, balanceActions?: BalanceAction[]): Promise<Map<string, TransactionStatus>> => {
    const newStatuses = new Map<string, TransactionStatus>();
    if (!balanceActions) {
        balanceActions = await fetchBalanceActions(sdk);
    }
    await Promise.all(balanceActions.map(async action => {
        if (action.status === TransactionStatus.Pending) {
            const newStatus = await updateBalanceActionStatus(sdk, action.txHash);
            if (newStatus !== action.status) {
                newStatuses.set(action.txHash, newStatus);
            }
        }
    }));
    return newStatuses;
};

// tslint:disable-next-line:no-any
export const onTxHash = (tx: PromiEvent<Transaction>): Promise<{ txHash: string, promiEvent: PromiEvent<Transaction> }> => {
    return new Promise((resolve, reject) => {
        tx
            .once("transactionHash", (txHash) => resolve({ txHash, promiEvent: tx }))
            .catch(reject);
    });
};
