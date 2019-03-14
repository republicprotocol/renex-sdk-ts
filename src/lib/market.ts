import RenExSDK from "../index";

import { OrderedMap } from "immutable";
import { MarketDetails, MarketPair, Token } from "../types";

export const MarketPairs = OrderedMap<MarketPair, MarketDetails>()
    // BTC pairs
    .set(MarketPair.ETH_BTC, { symbol: MarketPair.ETH_BTC, quote: Token.BTC, base: Token.ETH })
    // .set(MarketPair.REN_BTC, { symbol: MarketPair.REN_BTC, quote: Token.BTC, base: Token.REN })
    .set(MarketPair.TUSD_BTC, { symbol: MarketPair.TUSD_BTC, quote: Token.BTC, base: Token.TUSD })
    // ETH pairs
    // .set(MarketPair.DGX_ETH, { symbol: MarketPair.DGX_ETH, quote: Token.ETH, base: Token.DGX })
    .set(MarketPair.TUSD_ETH, { symbol: MarketPair.TUSD_ETH, quote: Token.ETH, base: Token.TUSD })
    .set(MarketPair.DAI_ETH, { symbol: MarketPair.DAI_ETH, quote: Token.ETH, base: Token.DAI })
    // .set(MarketPair.REN_ETH, { symbol: MarketPair.REN_ETH, quote: Token.ETH, base: Token.REN })
    // .set(MarketPair.ZRX_ETH, { symbol: MarketPair.ZRX_ETH, quote: Token.ETH, base: Token.ZRX })
    // .set(MarketPair.OMG_ETH, { symbol: MarketPair.OMG_ETH, quote: Token.ETH, base: Token.OMG })
    ;

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
