import RenExSDK from "../index";

import { OrderedMap } from "immutable";
import { MarketDetails, MarketPair, OrderSettlement, Token } from "../types";

export const MarketPairs: OrderedMap<MarketPair, MarketDetails> = OrderedMap<MarketPair, MarketDetails>()
    // RenExAtomic:
    .set(MarketPair.ETH_BTC, { symbol: MarketPair.ETH_BTC, orderSettlement: OrderSettlement.RenExAtomic, quote: Token.BTC, base: Token.ETH })
    // RenEx:
    .set(MarketPair.DGX_ETH, { symbol: MarketPair.DGX_ETH, orderSettlement: OrderSettlement.RenEx, quote: Token.ETH, base: Token.DGX })
    .set(MarketPair.TUSD_ETH, { symbol: MarketPair.TUSD_ETH, orderSettlement: OrderSettlement.RenEx, quote: Token.ETH, base: Token.TUSD })
    .set(MarketPair.REN_ETH, { symbol: MarketPair.REN_ETH, orderSettlement: OrderSettlement.RenEx, quote: Token.ETH, base: Token.REN })
    .set(MarketPair.ZRX_ETH, { symbol: MarketPair.ZRX_ETH, orderSettlement: OrderSettlement.RenEx, quote: Token.ETH, base: Token.ZRX })
    .set(MarketPair.OMG_ETH, { symbol: MarketPair.OMG_ETH, orderSettlement: OrderSettlement.RenEx, quote: Token.ETH, base: Token.OMG });

export async function fetchMarkets(sdk: RenExSDK): Promise<MarketDetails[]> {
    return Promise.resolve(MarketPairs.valueSeq().toArray());
}
