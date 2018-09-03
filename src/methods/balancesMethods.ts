import { UNIMPLEMENTED } from "@Lib/errors";
import RenExSDK, { IdempotentKey } from "@Root/index";
import { BN } from "bn.js";

import { RenExBalances, RenExTokens } from "@Contracts/contracts";
import BigNumber from "bignumber.js";

export const balance = async (sdk: RenExSDK, token: number): Promise<BigNumber> => {
    sdk.contracts.renExBalances = sdk.contracts.renExBalances || await RenExBalances.deployed();
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await RenExTokens.deployed();

    const tokenString = (await sdk.contracts.renExTokens.tokens(token)).addr;

    // TODO: Divide by decimals
    return new BigNumber(new BN(await sdk.contracts.renExBalances.traderBalances(sdk.address, tokenString)).toString());
};

export const usableBalance = async (sdk: RenExSDK, token: number): Promise<BigNumber> => {
    throw new Error(UNIMPLEMENTED);
};

export const withdraw = async (
    sdk: RenExSDK, token: number, value: BigNumber, forced: boolean, key: IdempotentKey
): Promise<IdempotentKey> => {
    throw new Error(UNIMPLEMENTED);
};
