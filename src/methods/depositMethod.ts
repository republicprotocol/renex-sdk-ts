import BigNumber from "bignumber.js";
import Web3 from "web3";

import { BN } from "bn.js";

import RenExSDK from "@Root/index";

import { ERC20, RenExTokens } from "@Contracts/contracts";
import { UNIMPLEMENTED } from "@Lib/errors";
import { Token, TokenDetails } from "@Lib/market";
import { TransactionReceipt } from "web3/types";

/**
 * Convert a readable amount to the token amount using the token decimals.
 * @param readable The amount represented as a string.
 * @param token The token used to represent the amount.
 */
export const readableToBalance = async (sdk: RenExSDK, readable: BigNumber, token: Token): Promise<BN> => {
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await RenExTokens.deployed();

    const tokenDetails = (await sdk.contracts.renExTokens.tokens(token));

    const e = new BigNumber(10).exponentiatedBy(new BN(tokenDetails.decimals).toNumber());
    return new BN(readable.times(e).toFixed());
};

export const deposit = async (sdk: RenExSDK, token: number, valueBig: BigNumber): Promise<void> => {

    const amountBN = await readableToBalance(sdk, valueBig, token);
    if (amountBN.lt(new BN(1))) {
        throw new Error("invalid amount");
    }

    const tokenDetails = (await sdk.contracts.renExTokens.tokens(token));

    const transactions = [];

    if (token === 1) {
        // const params = {
        //     from: sdk.account,
        //     value: amountBN.toNumber(),
        //     gas: undefined as number | undefined,
        // };

        // try {
        //     params.gas = await call.estimateGas(params);
        // } catch (err) {
        //     console.error("Unable to estimate gas for ETH deposit.");
        // }

        transactions.push({
            call: () => sdk.contracts.renExBalances.deposit(tokenDetails.addr, amountBN),
            name: "Deposit",
        });
    } else {
        // ERC20 token
        const tokenContract = ERC20.at(tokenDetails.addr);

        // If allowance is less than amount, user must first approve
        // TODO: This may cause the transaction to fail if the user call this
        // twice in a row rapidly (after already having an allowance set)
        // There's no way to check pending state - alternative is to see
        // if there are any pending deposits for the same token
        const allowance = await tokenContract.methods.allowance(sdk.account, sdk.contracts.renExBalances.address).call();
        if (new BN(allowance).lt(amountBN)) {
            transactions.push({
                call: () => tokenContract.methods.approve(sdk.contracts.renExBalances.address, amountBN).send({ from: sdk.account }),
                name: "Approve",
            });
        }
        transactions.push({
            call: () => sdk.contracts.renExBalances.deposit(
                tokenDetails.addr,
                amountBN, {
                    // Manually set gas limit since gas estimation won't work
                    // if the ethereum node hasn't seen the previous transaction
                    from: sdk.account,
                    gas: "150000",
                    value: amountBN.toNumber(),
                }),
            name: "Deposit",
        });
        // See https://github.com/MetaMask/metamask-extension/issues/3425
    }

    try {
        await MetaMask.sendTransactions(
            transactions,
            (txHash: string) => {
                // const balanceItem: any = balanceItem.set("txHash", txHash);
                // dispatch(pushBalance({ balanceItem }));
            },
            (receipt: TransactionReceipt | null) => {
                // if (receipt !== null && receipt.blockHash !== "") {
                //     balanceItem = balanceItem.set("status", BalanceItemStatus.Done);
                //     // Status type is string, but actually returns back as a boolean
                //     const status: any = receipt.status;
                //     if (status === "0" ||
                //         status === 0 ||
                //         status === false) {
                //         balanceItem = balanceItem.set("status", BalanceItemStatus.Failed);
                //     }
                //     dispatch(pushBalance({ balanceItem }));

                //     dispatch(setAlert({
                //         alert: new Alert({
                //             alertType: AlertType.Success,
                //             message: `${amount} ${token.symbol} has successfully been deposited. Your balances will be updated shortly.`,
                //         })
                //     }));

                //     getBalances(web3, renExBalancesContract, wallet, address, balanceHistory, traderOrders, usableBalances, settlements)(dispatch);
                // }
            },
        );
    } catch (error) {
        if (error.message.match("Insufficient funds")) {
            throw new Error("InsufficientFundsError");
        }
        if (error.message.match("User denied transaction signature")) {
            throw new Error("ErrorCanceledByUser");
        }
        console.error(error);
        throw new Error("FailedDepositError");
    }
};

export const MetaMask = {
    name: "MetaMask",
    slug: "metamask",
    description: "Sign in using the MetaMask extension or Mist wallet",
    enabled: true,
    getWeb3: async (): Promise<Web3> => {
        throw new Error(UNIMPLEMENTED);
        // const web3 = window.web3;
        // if (web3 === undefined) {
        //     throw new Error(ErrorNoMetaMask);
        // }
        // return new Web3(web3.currentProvider);
    },
    selectAccount: async (web3: Web3) => {
        const accounts = await getAccounts(web3);
        const network = await getNetwork(web3);

        if (accounts.length === 0) {
            throw new Error("ErrorMetaMaskLocked");
        }

        // if (network !== NetworkData.ethNetwork) {
        //     throw new Error(`Please ensure you are on the ${NetworkData.ethNetworkLabel} network in MetaMask`);
        // }
        return accounts[0];
    },
    sign: async (web3: Web3, data: string, address: string) => {
        return (web3.eth.personal.sign as any)(data, address);
    },
    sendTransactions: async (calls: any[], onHash: any, onReceipt: any) => {
        throw new Error(UNIMPLEMENTED);
    },
};

export function getAccounts(web3: Web3): Promise<string[]> {
    return web3.eth.getAccounts();
}

export function getNetwork(web3: Web3): Promise<string> {
    return (web3.eth.net as any).getNetworkType();
}

export function getBalance(web3: Web3, address: string): Promise<number> {
    return web3.eth.getBalance(address);
}
