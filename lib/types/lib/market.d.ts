import { OrderedMap } from "immutable";
import { OrderSettlement } from "../types";
export declare enum Token {
    BTC = 0,
    ETH = 1,
    DGX = 256,
    TUSD = 257,
    REN = 65536,
    ZRX = 65537,
    OMG = 65538
}
export declare const Tokens: Token[];
export interface PairDetails {
    code: Pair;
    orderSettlement: OrderSettlement;
    left: Token;
    right: Token;
    category?: Token;
}
export declare enum Pair {
    BTC_ETH = 1,
    ETH_DGX = 4294967552,
    ETH_TUSD = 4294967553,
    ETH_REN = 4295032832,
    ETH_ZRX = 4295032833,
    ETH_OMG = 4295032834
}
export declare const Pairs: OrderedMap<Pair, PairDetails>;
export interface TokenDetail {
    name: string;
    symbol: string;
    icon: string;
    address: string;
    pairs: OrderedMap<Token, Pair>;
    digits: number;
    cmcID: number;
    settlements: OrderSettlement[];
    offChain?: boolean;
}
