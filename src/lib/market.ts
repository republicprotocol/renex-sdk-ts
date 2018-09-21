import { OrderedMap } from "immutable";
import { OrderSettlement } from "../types";

export enum Token {
    BTC = 0x00000000,
    ETH = 0x00000001,
    DGX = 0x00000100,
    TUSD = 0x00000101,
    REN = 0x00010000,
    ZRX = 0x00010001,
    OMG = 0x00010002,
}

// For iterating over Tokens
export const Tokens: Token[] = [Token.BTC, Token.ETH, Token.DGX, Token.TUSD, Token.REN, Token.ZRX, Token.OMG];

export interface PairDetails {
    code: Pair;
    orderSettlement: OrderSettlement;
    left: Token;
    right: Token;
    category?: Token; // Force the pair to be shown under a specific token
}

export enum Pair {
    BTC_ETH = 0x0000000000000001,
    ETH_DGX = 0x0000000100000100,
    ETH_TUSD = 0x0000000100000101,
    ETH_REN = 0x0000000100010000,
    ETH_ZRX = 0x0000000100010001,
    ETH_OMG = 0x0000000100010002,
}

export const Pairs: OrderedMap<Pair, PairDetails> = OrderedMap<Pair, PairDetails>()
    // RenExAtomic:
    .set(Pair.BTC_ETH, { code: Pair.BTC_ETH, orderSettlement: OrderSettlement.RenExAtomic, left: Token.BTC, right: Token.ETH, category: Token.ETH })
    // RenEx:
    .set(Pair.ETH_DGX, { code: Pair.ETH_DGX, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.DGX })
    .set(Pair.ETH_TUSD, { code: Pair.ETH_TUSD, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.TUSD })
    .set(Pair.ETH_REN, { code: Pair.ETH_REN, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.REN })
    .set(Pair.ETH_ZRX, { code: Pair.ETH_ZRX, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.ZRX })
    .set(Pair.ETH_OMG, { code: Pair.ETH_OMG, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.OMG });

export interface TokenDetail {
    name: string;
    symbol: string;
    icon: string;
    address: string;
    pairs: OrderedMap<Token, Pair>;
    digits: number;
    cmcID: number; // CoinMarketCap ID
    settlements: OrderSettlement[];
    offChain?: boolean; // Off-chain implies that fees must be paid in the other token
}
