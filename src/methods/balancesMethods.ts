import { UNIMPLEMENTED } from "@Lib/errors";
import RenExSDK, { IdempotentKey, IntInput } from "@Root/index";
import { BN } from "bn.js";

import { RenExBalances, RenExTokens } from "@Contracts/contracts";
import BigNumber from "bignumber.js";

export const balance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    sdk.contracts.renExBalances = sdk.contracts.renExBalances || await RenExBalances.deployed();
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await RenExTokens.deployed();

    const tokenString = (await sdk.contracts.renExTokens.tokens(token)).addr;

    return new BN(await sdk.contracts.renExBalances.traderBalances(sdk.address, tokenString));
};

export const usableBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    throw new Error(UNIMPLEMENTED);
};

export const withdraw = async (
    sdk: RenExSDK, token: number, value: IntInput, forced: boolean, key: IdempotentKey
): Promise<IdempotentKey> => {
    throw new Error(UNIMPLEMENTED);
};
