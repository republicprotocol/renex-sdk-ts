import { BN } from "bn.js";

import RenExSDK, { BalanceAction, BalanceActionStatus, BalanceActionType, IntInput, TokenDetails, Transaction } from "../index";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { ErrCanceledByUser, ErrInsufficientFunds } from "../lib/errors";

const tokenIsEthereum = (token: TokenDetails) => {
    const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    return token.address.toLowerCase() === ETH_ADDR.toLowerCase();
};

export const deposit = async (sdk: RenExSDK, token: number, value: IntInput): Promise<BalanceAction> => {
    value = new BN(value);

    const tokenDetails = await sdk.tokenDetails(token);

    const balanceAction: BalanceAction = {
        action: BalanceActionType.Deposit,
        amount: value,
        time: Math.floor(new Date().getTime() / 1000),
        status: BalanceActionStatus.Pending,
        token,
        trader: sdk.address,
        txHash: "",
    };

    try {
        if (tokenIsEthereum(tokenDetails)) {
            const transaction: Transaction = await sdk.contracts.renExBalances
                .deposit(tokenDetails.address, value, { value: value.toString(), from: sdk.address });

            balanceAction.txHash = transaction.tx;

            sdk.storage.setBalanceAction(balanceAction).catch(console.error);

            return balanceAction;
        } else {
            // ERC20 token
            let tokenContract: ERC20Contract;
            if (!sdk.contracts.erc20.has(token)) {
                tokenContract = new (withProvider(sdk.web3, ERC20))(tokenDetails.address);
                sdk.contracts.erc20.set(token, tokenContract);
            } else {
                tokenContract = sdk.contracts.erc20.get(token);
            }

            // If allowance is less than amount, user must first approve
            // TODO: This may cause the transaction to fail if the user call this
            // twice in a row rapidly (after already having an allowance set)
            // There's no way to check pending state - alternative is to see
            // if there are any pending deposits for the same token
            const allowance = new BN(await tokenContract.allowance(sdk.address, sdk.contracts.renExBalances.address, { from: sdk.address }));
            if (allowance.lt(value)) {
                await tokenContract.approve(sdk.contracts.renExBalances.address, value, { from: sdk.address });
            }
            const transaction: Transaction = await sdk.contracts.renExBalances.deposit(
                tokenDetails.address,
                value,
                {
                    // Manually set gas limit since gas estimation won't work
                    // if the ethereum node hasn't seen the previous transaction
                    from: sdk.address,
                    gas: "150000",
                }
            );

            balanceAction.txHash = transaction.tx;

            sdk.storage.setBalanceAction(balanceAction).catch(console.error);

            return balanceAction;

            // TODO: https://github.com/MetaMask/metamask-extension/issues/3425
        }
    } catch (error) {
        if (error.tx) {
            balanceAction.txHash = error.tx;
            sdk.storage.setBalanceAction(balanceAction).catch(console.error);
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
