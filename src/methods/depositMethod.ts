import { BN } from "bn.js";

import RenExSDK, { IntInput } from "@Root/index";

import { ERC20 } from "@Contracts/contracts";

const tokenIsEthereum = (token: { addr: string, decimals: IntInput, registered: boolean }) => {
    const ETH_ADDR = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
    return token.addr.toLowerCase() === ETH_ADDR.toLowerCase();
};

export const deposit = async (sdk: RenExSDK, token: number, value: IntInput): Promise<void> => {
    value = new BN(value);

    const tokenDetails = (await sdk.contracts.renExTokens.tokens(token));

    try {
        if (tokenIsEthereum(tokenDetails)) {
            sdk.contracts.renExBalances.deposit(tokenDetails.addr, value);
        } else {
            // ERC20 token
            const tokenContract = ERC20.at(tokenDetails.addr);

            // If allowance is less than amount, user must first approve
            // TODO: This may cause the transaction to fail if the user call this
            // twice in a row rapidly (after already having an allowance set)
            // There's no way to check pending state - alternative is to see
            // if there are any pending deposits for the same token
            const allowance = await tokenContract.methods.allowance(sdk.address, sdk.contracts.renExBalances.address).call();
            if (new BN(allowance).lt(value)) {
                tokenContract.methods.approve(sdk.contracts.renExBalances.address, value).send({ from: sdk.address });
            }
            sdk.contracts.renExBalances.deposit(
                tokenDetails.addr,
                value,
                {
                    // Manually set gas limit since gas estimation won't work
                    // if the ethereum node hasn't seen the previous transaction
                    from: sdk.address,
                    gas: "150000",
                    value: value.toString(),
                }
            );
            // See https://github.com/MetaMask/metamask-extension/issues/3425
        }
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
