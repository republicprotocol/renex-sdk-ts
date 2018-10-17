import axios from "axios";

import { BN } from "bn.js";
import { Transaction, TransactionReceipt } from "web3/types";

import RenExSDK, { IntInput, TransactionStatus } from "../index";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { Token, TokenCode } from "../types";

export const transfer = async (sdk: RenExSDK, addr: string, token: TokenCode, valueBig: IntInput): Promise<void> => {
    const gasPrice = await sdk.getGasPrice();
    if (token === Token.ETH) {
        sdk.web3().eth.sendTransaction({
            from: sdk.address(),
            to: addr,
            value: new BN(valueBig).mul(new BN(10).pow(new BN(18))).toNumber(),
            gasPrice
        });
    } else {
        const tokenDetails = await sdk.tokenDetails(token);
        let tokenContract: ERC20Contract | undefined = sdk._contracts.erc20.get(token);
        if (!tokenContract) {
            tokenContract = new (withProvider(sdk.web3().currentProvider, ERC20))(tokenDetails.address);
            sdk._contracts.erc20.set(token, tokenContract);
        }
        const val = new BN(valueBig).mul(new BN(10).pow(new BN(tokenDetails.decimals)));
        await tokenContract.transfer(addr, val);
    }
};

export const getGasPrice = async (sdk: RenExSDK): Promise<number | undefined> => {
    const maxGasPrice = 60000000000;
    try {
        const resp = await axios.get("https://ethgasstation.info/json/ethgasAPI.json");
        if (resp.data.fast) {
            const gasPrice = resp.data.fast * Math.pow(10, 8);
            return gasPrice > maxGasPrice ? maxGasPrice : gasPrice;
        }
        throw new Error("cannot retrieve gas price from ethgasstation");
    } catch (error) {
        console.error(error);
        try {
            return await sdk.web3().eth.getGasPrice() * 1.1;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
};

/**
 * Returns the status of a transaction from its transaction hash.
 *
 * @param {RenExSDK} sdk
 * @param {string} txHash
 * @returns {Promise<TransactionStatus>} One of "pending", "confirmed",
 *          "failed", or "replaced"
 */
export const getTransactionStatus = async (sdk: RenExSDK, txHash: string): Promise<TransactionStatus> => {

    let receipt: TransactionReceipt | null = await sdk.web3().eth.getTransactionReceipt(txHash);

    // If the transaction hasn't been confirmed yet, it will either have a null
    // receipt, or it will have an empty blockhash.

    if (!receipt) {
        // If the receipt doesn't have a blockHash, check if its nonce is lower
        // than the trader's current nonce. This implies that the transaction
        // has been overwritten.

        // Get the current trader's nonce
        const traderNonce = await sdk.web3().eth.getTransactionCount(sdk.address());

        // Get transaction's nonce
        let transaction;
        try {
            transaction = await sdk._storage.getBalanceAction(txHash);
        } catch (err) {
            return TransactionStatus.Pending;
        }

        if (transaction === undefined || transaction.nonce === undefined) {
            return TransactionStatus.Pending;
        }

        // Check if the trader's nonce is higher than the transaction's nonce
        if (traderNonce > transaction.nonce) {
            // Check the transaction receipt again in case the transaction was
            // confirmed in the time between fetching the transaction and
            // getting the nonce. We could retrieve the nonce before the receipt
            // but most of the time we do not expect this scenario to happen.
            // This isn't perfect since the requests may hit different nodes.
            // One solution is to call `getTransactionStatus` again after a
            // delay if it has returned "replaced", to confirm the result.
            receipt = await sdk.web3().eth.getTransactionReceipt(txHash);

            // Check that the transaction isn't confirmed
            if (!receipt) {
                return TransactionStatus.Replaced;
            }
        } else {
            return TransactionStatus.Pending;
        }
    }

    if (!receipt.blockHash) {
        return TransactionStatus.Pending;
    }

    // Status type is string, but actually returns back as a boolean
    // tslint:disable-next-line:no-any
    const receiptStatus: any = receipt.status;
    if (receiptStatus === "0" || receiptStatus === 0 || receiptStatus === false) {
        return TransactionStatus.Failed;
    } else {
        return TransactionStatus.Done;
    }
};
