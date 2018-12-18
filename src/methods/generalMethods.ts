import axios from "axios";
import BigNumber from "bignumber.js";

import { TransactionReceipt } from "web3/types";

import RenExSDK, { NumberInput, TransactionStatus } from "../index";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { toSmallestUnit } from "../lib/tokens";
import { Token, TokenCode } from "../types";
import { getTokenDetails } from "./balancesMethods";

export const transfer = async (sdk: RenExSDK, addr: string, token: TokenCode, valueBig: NumberInput): Promise<void> => {
    const gasPrice = await getGasPrice(sdk);
    const tokenDetails = await getTokenDetails(sdk, token);
    const value = toSmallestUnit(new BigNumber(valueBig), tokenDetails).toFixed();
    if (token === Token.ETH) {
        sdk.getWeb3().eth.sendTransaction({
            from: sdk.getAddress(),
            to: addr,
            value,
            gasPrice
        });
    } else {
        let tokenContract: ERC20Contract | undefined = sdk._contracts.erc20.get(token);
        if (!tokenContract) {
            tokenContract = new (withProvider(sdk.getWeb3().currentProvider, ERC20))(tokenDetails.address);
            sdk._contracts.erc20.set(token, tokenContract);
        }
        await tokenContract.transfer(addr, sdk.getWeb3().utils.toHex(value));
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
        // TODO: Add error logging
        try {
            return await sdk.getWeb3().eth.getGasPrice() * 1.1;
        } catch (error) {
            // TODO: Add error logging
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

    let receipt: TransactionReceipt | null = await sdk.getWeb3().eth.getTransactionReceipt(txHash);

    // If the transaction hasn't been confirmed yet, it will either have a null
    // receipt, or it will have an empty blockhash.

    if (!receipt) {
        // If the receipt doesn't have a blockHash, check if its nonce is lower
        // than the trader's current nonce. This implies that the transaction
        // has been overwritten.

        // Get the current trader's nonce
        const traderNonce = await sdk.getWeb3().eth.getTransactionCount(sdk.getAddress());

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
            receipt = await sdk.getWeb3().eth.getTransactionReceipt(txHash);

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
