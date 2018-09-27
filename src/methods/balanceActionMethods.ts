import { BN } from "bn.js";
import { PromiEvent } from "web3/types";

import RenExSDK from "../index";
import { BalanceAction, BalanceActionType, IntInput, TokenDetails, Transaction, TransactionStatus } from "../types";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { ErrCanceledByUser, ErrInsufficientBalance, ErrInsufficientFunds, ErrUnimplemented } from "../lib/errors";
import { requestWithdrawalSignature } from "../lib/ingress";
import { nondepositedBalance, usableBalance } from "./balancesMethods";
import { getTransactionStatus } from "./generalMethods";

const tokenIsEthereum = (token: TokenDetails) => {
    const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    return token.address.toLowerCase() === ETH_ADDR.toLowerCase();
};

export const getBalanceActionStatus = async (sdk: RenExSDK, txHash: string): Promise<TransactionStatus> => {

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

// tslint:disable-next-line:no-any
export const onTxHash = (tx: PromiEvent<Transaction>): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        tx
            .on("transactionHash", resolve)
            .catch(reject);
    });
};

export const deposit = async (sdk: RenExSDK, token: number, value: IntInput): Promise<BalanceAction> => {
    value = new BN(value);

    // Check that we can deposit that amount
    const balance = await nondepositedBalance(sdk, token);
    if (value.gt(balance)) {
        throw new Error(ErrInsufficientBalance);
    }

    const tokenDetails = await sdk.tokenDetails(token);
    const gasPrice = await sdk.getGasPrice();

    const balanceAction: BalanceAction = {
        action: BalanceActionType.Deposit,
        amount: value,
        time: Math.floor(new Date().getTime() / 1000),
        status: TransactionStatus.Pending,
        token,
        trader: sdk.address(),
        txHash: "",
        nonce: undefined,
    };

    try {
        if (tokenIsEthereum(tokenDetails)) {
            const transactionHash = await onTxHash(sdk._contracts.renExBalances
                .deposit(tokenDetails.address, value, { value: value.toString(), from: sdk.address(), gasPrice }));

            balanceAction.txHash = transactionHash;

            // Set balanceAction nonce after creating, to guarantee it's not
            // less than its real nonce
            balanceAction.nonce = await sdk.web3().eth.getTransactionCount(sdk.address());

            sdk._storage.setBalanceAction(balanceAction).catch(console.error);

            return balanceAction;
        } else {
            // ERC20 token
            let tokenContract: ERC20Contract | undefined = sdk._contracts.erc20.get(token);
            if (tokenContract === undefined) {
                tokenContract = new (withProvider(sdk.web3().currentProvider, ERC20))(tokenDetails.address);
                sdk._contracts.erc20.set(token, tokenContract);
            }

            // If allowance is less than amount, user must first approve
            // TODO: This may cause the transaction to fail if the user call this
            // twice in a row rapidly (after already having an allowance set)
            // There's no way to check pending state - alternative is to see
            // if there are any pending deposits for the same token
            const allowance = new BN(await tokenContract.allowance(sdk.address(), sdk._contracts.renExBalances.address, { from: sdk.address(), gasPrice }));
            if (allowance.lt(value)) {
                await onTxHash(tokenContract.approve(sdk._contracts.renExBalances.address, value, { from: sdk.address(), gasPrice }));
            }
            const transactionHash = await onTxHash(sdk._contracts.renExBalances.deposit(
                tokenDetails.address,
                value,
                {
                    // Manually set gas limit since gas estimation won't work
                    // if the ethereum node hasn't seen the previous transaction
                    gas: token === 256 ? 500000 : 150000,
                    gasPrice,
                    from: sdk.address(),
                }
            ));

            balanceAction.txHash = transactionHash;

            // Set balanceAction nonce after creating, to guarantee it's not
            // less than its real nonce
            balanceAction.nonce = await sdk.web3().eth.getTransactionCount(sdk.address());

            sdk._storage.setBalanceAction(balanceAction).catch(console.error);

            return balanceAction;

            // TODO: https://github.com/MetaMask/metamask-extension/issues/3425
        }
    } catch (error) {
        if (error.tx) {
            balanceAction.txHash = error.tx;
            sdk._storage.setBalanceAction(balanceAction).catch(console.error);
            return balanceAction;
        }

        if (error.message.match("Insufficient funds")) {
            throw new Error(ErrInsufficientFunds);
        }
        if (error.message.match("User denied transaction signature")) {
            throw new Error(ErrCanceledByUser);
        }
        throw error;
    }
};

export const withdraw = async (
    sdk: RenExSDK, token: number, value: IntInput, withoutIngressSignature: boolean
): Promise<BalanceAction> => {
    value = new BN(value);

    // Trustless withdrawals are not implemented yet
    if (withoutIngressSignature === true) {
        throw new Error(ErrUnimplemented);
    }

    // Check the balance before withdrawal attempt
    const balance = await usableBalance(sdk, token);
    if (value.gt(balance)) {
        throw new Error(ErrInsufficientBalance);
    }

    const tokenDetails = await sdk.tokenDetails(token);
    const gasPrice = await sdk.getGasPrice();

    const balanceAction: BalanceAction = {
        action: BalanceActionType.Withdraw,
        amount: value,
        time: Math.floor(new Date().getTime() / 1000),
        status: TransactionStatus.Pending,
        token,
        trader: sdk.address(),
        txHash: "",
        nonce: undefined,
    };

    try {
        const signature = await requestWithdrawalSignature(sdk._networkData.ingress, sdk.address(), token);

        const transactionHash = await onTxHash(sdk._contracts.renExBalances.withdraw(tokenDetails.address, value, signature.toHex(), { from: sdk.address(), gasPrice }));

        // Update balance action
        balanceAction.txHash = transactionHash;

        // Set balanceAction nonce after creating, to guarantee it's not
        // less than its real nonce
        balanceAction.nonce = await sdk.web3().eth.getTransactionCount(sdk.address());

        sdk._storage.setBalanceAction(balanceAction).catch(console.error);

        return balanceAction;

    } catch (error) {
        if (error.tx) {
            balanceAction.txHash = error.tx;
            sdk._storage.setBalanceAction(balanceAction).catch(console.error);
            return balanceAction;
        }

        if (error.message.match("Insufficient funds")) {
            throw new Error(ErrInsufficientFunds);
        }
        if (error.message.match("User denied transaction signature")) {
            throw new Error(ErrCanceledByUser);
        }
        throw error;
    }
};
