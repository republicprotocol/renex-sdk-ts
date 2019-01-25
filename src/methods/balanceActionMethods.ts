import BigNumber from "bignumber.js";

import BN from "bn.js";
import PromiEvent from "web3/promiEvent";

import RenExSDK from "../index";
import { BalanceAction, BalanceActionType, NumberInput, Token, TokenCode, TokenDetails, Transaction, TransactionOptions, TransactionStatus, WithdrawTransactionOptions } from "../types";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { errors, updateError } from "../errors";
import { requestWithdrawalSignature } from "../lib/ingress";
import { toSmallestUnit } from "../lib/tokens";
import { LATEST_BALANCE_ACTION_VERSION } from "../storage/serializers";
import { balances, getTokenDetails } from "./balancesMethods";
import { getTransactionStatus } from "./generalMethods";
import { defaultTransactionOptions } from "./orderbookMethods";
import { fetchBalanceActions } from "./storageMethods";

const tokenIsEthereum = (token: TokenDetails) => {
    const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    return token.address.toLowerCase() === ETH_ADDR.toLowerCase();
};

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

export const deposit = async (
    sdk: RenExSDK,
    value: NumberInput,
    token: TokenCode,
    options?: TransactionOptions,
): Promise<{ balanceAction: BalanceAction, promiEvent: PromiEvent<Transaction> | null }> => {
    value = new BigNumber(value);

    // Check that we can deposit that amount
    const tokenBalance = await balances(sdk, [token]).then(b => b.get(token));
    if (tokenBalance && tokenBalance.nondeposited === null) {
        throw new Error(errors.FailedBalanceCheck);
    } else if (tokenBalance && tokenBalance.nondeposited !== null && value.gt(tokenBalance.nondeposited)) {
        throw new Error(errors.InsufficientBalance);
    }

    const address = sdk.getAddress();
    const tokenDetails = await getTokenDetails(sdk, token);
    const { awaitConfirmation, gasPrice } = await defaultTransactionOptions(sdk, options);

    const valueBN = new BN(toSmallestUnit(value, tokenDetails).toFixed());

    const balanceAction: BalanceAction = {
        version: LATEST_BALANCE_ACTION_VERSION,
        action: BalanceActionType.Deposit,
        amount: value,
        time: Math.floor(new Date().getTime() / 1000),
        status: TransactionStatus.Pending,
        token,
        trader: address,
        txHash: "",
        nonce: undefined,
    };

    try {
        let promiEvent;
        let tx;
        if (tokenIsEthereum(tokenDetails)) {
            tx = await onTxHash(sdk._contracts.renExBalances.deposit(
                tokenDetails.address,
                sdk.getWeb3().utils.toHex(valueBN),
                { value: valueBN.toString(), from: address, gasPrice },
            ));
        } else {
            // ERC20 token
            let tokenContract: ERC20Contract | undefined = sdk._contracts.erc20.get(token);
            if (tokenContract === undefined) {
                tokenContract = new (withProvider(sdk.getWeb3().currentProvider, ERC20))(tokenDetails.address);
                sdk._contracts.erc20.set(token, tokenContract);
            }

            // If allowance is less than amount, user must first approve
            // TODO: This may cause the transaction to fail if the user call this
            // twice in a row rapidly (after already having an allowance set)
            // There's no way to check pending state - alternative is to see
            // if there are any pending deposits for the same token
            const allowance = new BN(await tokenContract.allowance(address, sdk._contracts.renExBalances.address, { from: address, gasPrice }));
            if (allowance.lt(valueBN)) {
                await onTxHash(tokenContract.approve(sdk._contracts.renExBalances.address,
                    sdk.getWeb3().utils.toHex(valueBN),
                    { from: address, gasPrice }));
            }

            tx = await onTxHash(sdk._contracts.renExBalances.deposit(
                tokenDetails.address,
                sdk.getWeb3().utils.toHex(valueBN),
                {
                    // Manually set gas limit since gas estimation won't work
                    // if the ethereum node hasn't seen the previous transaction
                    gas: token === Token.DGX ? 500000 : 150000,
                    gasPrice,
                    from: address,
                    // nonce: balanceAction.nonce,
                }
            ));
        }

        promiEvent = tx.promiEvent;
        balanceAction.txHash = tx.txHash;

        // We set the nonce after the transaction is created. We don't set
        // it before hand in case the user signs other transactions while
        // the wallet popup (or equivalent) is open. We rely on the wallet's
        // nonce tracking to return the correct nonce immediately.
        try {
            balanceAction.nonce = (await sdk.getWeb3().eth.getTransactionCount(address, "pending")) - 1;
        } catch (err) {
            // Log the error but leave the nonce as undefined
            console.error(err);
        }

        sdk._storage.setBalanceAction(balanceAction).catch(console.error);

        // TODO: https://github.com/MetaMask/metamask-extension/issues/3425
        if (awaitConfirmation) {
            await promiEvent;
        }
        return { balanceAction, promiEvent };
    } catch (error) {
        if (error.tx) {
            balanceAction.txHash = error.tx;
            sdk._storage.setBalanceAction(balanceAction).catch(console.error);
            return { balanceAction, promiEvent: null };
        }

        if (error.message.match("Insufficient funds")) {
            throw updateError(errors.InsufficientFunds, error);
        }
        if (error.message.match("User denied transaction signature")) {
            throw updateError(errors.CanceledByUser, error);
        }
        throw error;
    }
};

export const withdraw = async (
    sdk: RenExSDK,
    value: NumberInput,
    token: TokenCode,
    options?: WithdrawTransactionOptions,
): Promise<{ balanceAction: BalanceAction, promiEvent: PromiEvent<Transaction> | null }> => {
    value = new BigNumber(value);

    // Trustless withdrawals are not implemented yet
    if (options && options.withoutIngressSignature === true) {
        throw new Error(errors.Unimplemented);
    }

    // Check the balance before withdrawal attempt
    const tokenBalance = await balances(sdk, [token]).then(b => b.get(token));
    if (tokenBalance && tokenBalance.free === null) {
        throw new Error(errors.FailedBalanceCheck);
    } else if (tokenBalance && tokenBalance.free !== null && value.gt(tokenBalance.free)) {
        throw new Error(errors.InsufficientBalance);
    }

    const address = sdk.getAddress();
    const tokenDetails = await getTokenDetails(sdk, token);
    const { awaitConfirmation, gasPrice } = await defaultTransactionOptions(sdk, options);

    const valueBN = new BN(toSmallestUnit(value, tokenDetails).toFixed());

    const balanceAction: BalanceAction = {
        version: LATEST_BALANCE_ACTION_VERSION,
        action: BalanceActionType.Withdraw,
        amount: value,
        time: Math.floor(new Date().getTime() / 1000),
        status: TransactionStatus.Pending,
        token,
        trader: address,
        txHash: "",
        nonce: undefined,
    };

    try {
        const signature = await requestWithdrawalSignature(sdk._networkData.ingress, address, token);

        const { txHash, promiEvent } = await onTxHash(sdk._contracts.renExBalances.withdraw(
            tokenDetails.address,
            `0x${valueBN.toString("hex")}`,
            signature.toHex(),
            { from: address, gasPrice, /* nonce: balanceAction.nonce */ },
        ));

        // Update balance action
        balanceAction.txHash = txHash;

        // We set the nonce after the transaction is created. We don't set
        // it before hand in case the user signs other transactions while
        // the wallet popup (or equivalent) is open. We rely on the wallet's
        // nonce tracking to return the correct nonce immediately.
        try {
            balanceAction.nonce = (await sdk.getWeb3().eth.getTransactionCount(address, "pending")) - 1;
        } catch (err) {
            // Log the error but leave the nonce as undefined
            console.error(err);
        }

        sdk._storage.setBalanceAction(balanceAction).catch(console.error);

        if (awaitConfirmation) {
            await promiEvent;
        }
        return { balanceAction, promiEvent };

    } catch (error) {
        if (error.tx) {
            balanceAction.txHash = error.tx;
            sdk._storage.setBalanceAction(balanceAction).catch(console.error);
            return { balanceAction, promiEvent: null };
        }

        if (error.message.match("Insufficient funds")) {
            throw updateError(errors.InsufficientFunds, error);
        }
        if (error.message.match("User denied transaction signature")) {
            throw updateError(errors.CanceledByUser, error);
        }
        throw error;
    }
};
