import { Map, OrderedMap } from "immutable";
import { NetworkData } from "./network";
import * as fetch from 'node-fetch';

export enum OrderSettlement {
    RenEx = 1,
    RenExAtomic = 2,
}

export enum Token {
    BTC = 0x00000000,
    ETH = 0x00000001,
    DGX = 0x00000100,
    REN = 0x00010000,
    ABC = 0x00010001,
    XYZ = 0x00010002,
}

// For iterating over Tokens
export const Tokens: Token[] = [Token.BTC, Token.ETH, Token.REN, Token.DGX, Token.ABC, Token.XYZ];


export interface PairDetails {
    code: Pair;
    orderSettlement: OrderSettlement;
    left: Token;
    right: Token;
    category?: Token; // Force the pair to be shown under a specific token
}

export enum Pair {
    BTCETH = 0x0000000000000001,
    ETHDGX = 0x0000000100000100,
    ETHREN = 0x0000000100010000,
    ETHABC = 0x0000000100010001,
    ETHXYZ = 0x0000000100010002,
}

export const Pairs: OrderedMap<Pair, PairDetails> = OrderedMap<Pair, PairDetails>()
    // RenExAtomic:
    .set(Pair.BTCETH, { code: Pair.BTCETH, orderSettlement: OrderSettlement.RenExAtomic, left: Token.BTC, right: Token.ETH, category: Token.ETH })
    // RenEx:
    .set(Pair.ETHDGX, { code: Pair.ETHDGX, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.DGX })
    .set(Pair.ETHREN, { code: Pair.ETHREN, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.REN })
    .set(Pair.ETHABC, { code: Pair.ETHABC, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.ABC })
    .set(Pair.ETHXYZ, { code: Pair.ETHXYZ, orderSettlement: OrderSettlement.RenEx, left: Token.ETH, right: Token.XYZ });

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

export let TokenDetails: Map<Token, TokenDetail> = Map();

TokenDetails = TokenDetails.set(Token.BTC, {
    name: "Bitcoin",
    symbol: "BTC",
    icon: "btc.svg",
    address: "",
    pairs: OrderedMap<Token, Pair>(),
    digits: 8,
    cmcID: 1,
    settlements: [OrderSettlement.RenExAtomic],
    offChain: true,
});

TokenDetails = TokenDetails.set(Token.ETH, {
    name: "Ethereum",
    symbol: "ETH",
    icon: "eth.svg",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    pairs: OrderedMap<Token, Pair>()
        .set(Token.BTC, Pair.BTCETH)
        .set(Token.DGX, Pair.ETHDGX)
        .set(Token.REN, Pair.ETHREN)
        .set(Token.ABC, Pair.ETHABC)
        .set(Token.XYZ, Pair.ETHXYZ)
    ,
    digits: 18,
    cmcID: 1027,
    settlements: [OrderSettlement.RenEx, OrderSettlement.RenExAtomic],
});

TokenDetails = TokenDetails.set(Token.DGX, {
    name: "Digix Gold Token",
    symbol: "DGX",
    icon: "dgx.png",
    address: NetworkData.tokens.DGX,
    pairs: OrderedMap<Token, Pair>(),
    digits: 9,
    cmcID: 2739,
    settlements: [OrderSettlement.RenEx],
});

TokenDetails = TokenDetails.set(Token.REN, {
    name: "Republic Token",
    symbol: "REN",
    icon: "ren.svg",
    address: NetworkData.tokens.REN,
    pairs: OrderedMap<Token, Pair>(),
    digits: 18,
    cmcID: 2539,
    settlements: [OrderSettlement.RenEx],
});

TokenDetails = TokenDetails.set(Token.ABC, {
    name: "ABC Test Token",
    symbol: "ABC",
    icon: "abc.svg",
    address: NetworkData.tokens.ABC,
    pairs: OrderedMap<Token, Pair>(),
    digits: 12,
    cmcID: 1758,
    settlements: [OrderSettlement.RenEx],
});

TokenDetails = TokenDetails.set(Token.XYZ, {
    name: "XYZ Test Token",
    symbol: "XYZ",
    icon: "xyz.svg",
    address: NetworkData.tokens.XYZ,
    pairs: OrderedMap<Token, Pair>(),
    digits: 18,
    cmcID: 1982,
    settlements: [OrderSettlement.RenEx],
});

/**
 * Retrieves the current pricepoint for two currencies.
 * @param fstCode The first currency.
 * @param sndCode The second currency.
 * @returns An array containing the price with respect to the currencies, and the 24 hour percent change.
 */
export async function getPrice(fstCode: Token, sndCode: Token): Promise<[number, number]> {
    const fromID = TokenDetails.get(sndCode).cmcID;
    const toSymbol = TokenDetails.get(fstCode).symbol;
    const url = `https://api.coinmarketcap.com/v2/ticker/${fromID}/?convert=${toSymbol}`;
    const response = await fetch.default(url);
    const data = await response.json();
    let price: number | null = data.data.quotes[toSymbol].price;
    let percentChange: number | null = data.data.quotes[toSymbol].percent_change_24h;
    if (percentChange === null) {
        percentChange = 0;
    }
    if (price === null) {
        price = 0;
    }
    return [price, percentChange];
}

export const RenExTokens = Tokens.filter((token) => {
    return TokenDetails.get(token).settlements.indexOf(OrderSettlement.RenEx) !== -1;
});

export const RenExAtomicTokens = Tokens.filter((token) => {
    return TokenDetails.get(token).settlements.indexOf(OrderSettlement.RenExAtomic) !== -1;
});
