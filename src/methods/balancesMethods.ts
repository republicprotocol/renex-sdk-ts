import BigNumber from "bignumber.js";

import RenExSDK from "../index";

import { tokenToID } from "../lib/tokens";
import { Token, TokenDetails } from "../types";

export const getTokenDetails = async (sdk: RenExSDK, token: Token): Promise<TokenDetails> => {
    let detailsFromContract = await sdk._cachedTokenDetails.get(token);

    if (!detailsFromContract) {
        const detailsPromise = sdk._contracts.renExTokens.tokens(tokenToID(token));
        sdk._cachedTokenDetails.set(token, detailsPromise);
        detailsFromContract = await detailsPromise;
    }

    const details: TokenDetails = {
        address: detailsFromContract.addr,
        decimals: new BigNumber(detailsFromContract.decimals).toNumber(),
        registered: detailsFromContract.registered,
    };

    return details;
};
