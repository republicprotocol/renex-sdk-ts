import { BN } from "bn.js";

import { UNIMPLEMENTED } from "@Lib/errors";
import RenExSDK from "@Root/index";

export const address = (sdk: RenExSDK): string => {
    throw new Error(UNIMPLEMENTED);
}

export const transfer = async (sdk: RenExSDK, address: string, token: number, value: BN): Promise<void> => {
    throw new Error(UNIMPLEMENTED);
}
