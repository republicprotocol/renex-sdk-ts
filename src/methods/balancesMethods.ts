import { UNIMPLEMENTED } from "@Lib/errors";
import RenExSDK, { IdempotentKey, IntInput } from "@Root/index";
import { BN } from "bn.js";

import { RenExBalances, RenExTokens, withProvider } from "@Contracts/contracts";
import { requestWithdrawalSignature } from "@Lib/ingress";
import { NetworkData } from "@Lib/network";

export const balance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    sdk.contracts.renExBalances = sdk.contracts.renExBalances || await withProvider(sdk.web3, RenExBalances).at(NetworkData.contracts[0].renExBalances);
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await withProvider(sdk.web3, RenExTokens).at(NetworkData.contracts[0].renExTokens);

    const tokenString = (await sdk.contracts.renExTokens.tokens(token)).addr;

    return new BN(await sdk.contracts.renExBalances.traderBalances(sdk.address, tokenString));
};

export const usableBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    // TODO: Subtract balances locked up in orders
    return balance(sdk, token);
};

export const withdraw = async (
    sdk: RenExSDK, token: number, value: IntInput, withoutIngressSignature: boolean, key?: IdempotentKey
): Promise<IdempotentKey | void> => {

    // Trustless withdrawals are not implemented yet
    if (withoutIngressSignature === true || key !== undefined) {
        throw new Error(UNIMPLEMENTED);
    }

    sdk.contracts.renExBalances = sdk.contracts.renExBalances || await withProvider(sdk.web3, RenExBalances).at(NetworkData.contracts[0].renExBalances);

    const tokenString = (await sdk.contracts.renExTokens.tokens(token)).addr;

    // TODO: Check balance

    const signature = await requestWithdrawalSignature(sdk.address, token);
    await sdk.contracts.renExBalances.withdraw(tokenString, value, signature);
};
