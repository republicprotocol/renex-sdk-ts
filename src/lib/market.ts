import { Map, OrderedMap } from "immutable";

export enum OrderSettlement {
    RenEx = 1,
    RenExAtomic = 2,
}

export enum Token {
    BTC = 0x00000000,
    ETH = 0x00000001,
    DGX = 0x00000100,
    ABC = 0x00000101,
    REN = 0x00010000,
    PQR = 0x00010001,
    XYZ = 0x00010002,
}

// For iterating over Tokens
export const Tokens: Token[] = [Token.BTC, Token.ETH, Token.REN, Token.DGX, Token.ABC, Token.PQR, Token.XYZ];

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
    ETH_ABC = 0x0000000100000101,
    ETH_REN = 0x0000000100010000,
    ETH_PQR = 0x0000000100010001,
    ETH_XYZ = 0x0000000100010002,
}

export const Pairs: OrderedMap<Pair, PairDetails> = OrderedMap<Pair, PairDetails>()
    // RenExAtomic:
    .set(Pair.BTC_ETH, { code: Pair.BTC_ETH, orderSettlement: OrderSettlement.RenExAtomic, left: Token.BTC, right: Token.ETH, category: Token.ETH })
    // RenEx:
    .set(Pair.ETH_DGX, { code: Pair.ETH_DGX, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.DGX })
    .set(Pair.ETH_REN, { code: Pair.ETH_REN, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.REN })
    .set(Pair.ETH_ABC, { code: Pair.ETH_ABC, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.ABC })
    .set(Pair.ETH_PQR, { code: Pair.ETH_PQR, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.PQR })
    .set(Pair.ETH_XYZ, { code: Pair.ETH_XYZ, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.XYZ });

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
