import { UNIMPLEMENTED } from "@Lib/errors";
import RenExSDK, { IdempotentKey } from "@Root/index";
import { BN } from "bn.js";

export const balance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    throw new Error(UNIMPLEMENTED);
};

export const usableBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    throw new Error(UNIMPLEMENTED);
};

export const deposit = async (sdk: RenExSDK, token: number, value: BN): Promise<void> => {
    throw new Error(UNIMPLEMENTED);
};

export const withdraw = async (
    sdk: RenExSDK, token: number, value: BN, forced: boolean, key: IdempotentKey
): Promise<IdempotentKey> => {
    throw new Error(UNIMPLEMENTED);
};
