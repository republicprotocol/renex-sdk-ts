import RenExSDK from "../index";

import { OrderedMap } from "immutable";
import { MarketDetails } from "../types";
import { MarketPair, MarketPairs, Token } from "./tokens";

export const getMarket = (left: Token, right: Token): MarketPair | undefined => {
    return (
        MarketPairs.findKey((marketDetails) => marketDetails.base === left && marketDetails.quote === right) ||
        MarketPairs.findKey((marketDetails) => marketDetails.base === right && marketDetails.quote === left) ||
        undefined
    );
};

export async function fetchMarkets(_sdk: RenExSDK): Promise<OrderedMap<MarketPair, MarketDetails>> {
    return MarketPairs;
}
