import BigNumber from "bignumber.js";

import RenExSDK from "../index";

/**
 * Returns the percentage fees required by the darknodes.
 */
export const darknodeFees = async (_sdk: RenExSDK): Promise<BigNumber> => {
    return new BigNumber(2).dividedBy(1000);
};
