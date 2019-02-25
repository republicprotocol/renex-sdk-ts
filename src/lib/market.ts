import RenExSDK from "../index";

import { OrderedMap } from "immutable";
import { MarketCode, MarketDetails, MarketPair, OrderSettlement, Token } from "../types";

export const MarketPairs: OrderedMap<MarketCode, MarketDetails> = OrderedMap<MarketCode, MarketDetails>()
    // BTC pairs
    // .set(MarketPair.ETH_BTC, { symbol: MarketPair.ETH_BTC, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.BTC, base: Token.ETH })
    // .set(MarketPair.REN_BTC, { symbol: MarketPair.REN_BTC, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.BTC, base: Token.REN })
    .set(MarketPair.TUSD_BTC, { symbol: MarketPair.TUSD_BTC, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.BTC, base: Token.TUSD })
    // ETH pairs
    // .set(MarketPair.DGX_ETH, { symbol: MarketPair.DGX_ETH, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.ETH, base: Token.DGX })
    // .set(MarketPair.TUSD_ETH, { symbol: MarketPair.TUSD_ETH, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.ETH, base: Token.TUSD })
    // .set(MarketPair.REN_ETH, { symbol: MarketPair.REN_ETH, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.ETH, base: Token.REN })
    // .set(MarketPair.ZRX_ETH, { symbol: MarketPair.ZRX_ETH, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.ETH, base: Token.ZRX })
    // .set(MarketPair.OMG_ETH, { symbol: MarketPair.OMG_ETH, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.ETH, base: Token.OMG })
    ;

export async function fetchMarkets(sdk: RenExSDK): Promise<MarketDetails[]> {
    return Promise.resolve(MarketPairs.valueSeq().toArray());
}
