import BigNumber from "bignumber.js";
import BN from "bn.js";
import { OrderedMap } from "immutable";
import { MarketDetails, NumberInput, TokenDetails } from "../types";

export enum Token {
    DAI = "DAI",
    BTC = "BTC",
    ETH = "ETH",
    REN = "REN",
    TUSD = "TUSD",
    WBTC = "WBTC",
}

export const Tokens = new Map<Token, TokenDetails>()
    .set(Token.DAI, { symbol: Token.DAI, name: "Dai", decimals: 18, priority: 100 })
    .set(Token.BTC, { symbol: Token.BTC, name: "Bitcoin", decimals: 8, priority: 200 })
    .set(Token.ETH, { symbol: Token.ETH, name: "Ethereum", decimals: 18, priority: 1024 })
    .set(Token.REN, { symbol: Token.REN, name: "Ren", decimals: 18, priority: 1025 })
    .set(Token.TUSD, { symbol: Token.TUSD, name: "TrueUSD", decimals: 18, priority: 1026 })
    .set(Token.WBTC, { symbol: Token.WBTC, name: "Wrapped Bitcoin", decimals: 8, priority: 201 })
    ;

export enum MarketPair {
    BTC_DAI = "BTC/DAI",
    ETH_DAI = "ETH/DAI",
    REN_DAI = "REN/DAI",
    TUSD_DAI = "TUSD/DAI",

    ETH_BTC = "ETH/BTC",
    REN_BTC = "REN/BTC",
    TUSD_BTC = "TUSD/BTC",
    WBTC_BTC = "BTC/WBTC",
}

export const MarketPairs = OrderedMap<MarketPair, MarketDetails>()
    // DAI pairs
    .set(MarketPair.BTC_DAI, { symbol: MarketPair.BTC_DAI, quote: Token.DAI, base: Token.BTC })
    .set(MarketPair.ETH_DAI, { symbol: MarketPair.ETH_DAI, quote: Token.DAI, base: Token.ETH })
    .set(MarketPair.REN_DAI, { symbol: MarketPair.REN_DAI, quote: Token.DAI, base: Token.REN })
    .set(MarketPair.TUSD_DAI, { symbol: MarketPair.TUSD_DAI, quote: Token.DAI, base: Token.TUSD })

    // BTC pairs
    .set(MarketPair.ETH_BTC, { symbol: MarketPair.ETH_BTC, quote: Token.BTC, base: Token.ETH })
    .set(MarketPair.REN_BTC, { symbol: MarketPair.REN_BTC, quote: Token.BTC, base: Token.REN })
    .set(MarketPair.TUSD_BTC, { symbol: MarketPair.TUSD_BTC, quote: Token.BTC, base: Token.TUSD })
    .set(MarketPair.WBTC_BTC, { symbol: MarketPair.WBTC_BTC, quote: Token.BTC, base: Token.WBTC })
    ;

// TokenDetails = TokenDetails.set(Token.WBTC, {
//     name: "Wrapped Bitcoin",
//     symbol: "WBTC",
//     icon: "wbtc.svg",
//     pairs: OrderedMap<Token, Pair>(),
//     digits: 8,
//     cmcID: 1, // for now, we use bitcoin price because WBTC isn't tracked yet
//     coingeckoID: "bitcoin",
// });

// TokenDetails = TokenDetails.set(Token.DGX, {
//     name: "Digix Gold Token",
//     symbol: "DGX",
//     icon: "dgx.svg",
//     pairs: OrderedMap<Token, Pair>(),
//     digits: 9,
//     cmcID: 2739,
//     coingeckoID: "digix-gold",
// });

// TokenDetails = TokenDetails.set(Token.REN, {
//     name: "Republic Protocol",
//     symbol: "REN",
//     icon: "ren.svg",
//     pairs: OrderedMap<Token, Pair>(),
//     digits: 18,
//     cmcID: 2539,
//     coingeckoID: "republic-protocol",
// });

// TokenDetails = TokenDetails.set(Token.OMG, {
//     name: "OmiseGo",
//     symbol: "OMG",
//     icon: "omg.svg",
//     pairs: OrderedMap<Token, Pair>(),
//     digits: 18,
//     cmcID: 1808,
//     coingeckoID: "omisego",
// });

// TokenDetails = TokenDetails.set(Token.ZRX, {
//     name: "0x",
//     symbol: "ZRX",
//     icon: "zrx.svg",
//     pairs: OrderedMap<Token, Pair>(),
//     digits: 18,
//     cmcID: 1896,
//     coingeckoID: "0x",
// });

export function toSmallestUnit(amount: NumberInput, decimals: number): BigNumber {
    return new BigNumber(amount).times(new BigNumber(10).exponentiatedBy(decimals));
}

export function fromSmallestUnit(amount: NumberInput, decimals: number): BigNumber {
    return new BigNumber(amount).div(new BigNumber(10).exponentiatedBy(decimals));
}

/**
 * Combine two 32-bit token identifiers into a single 64-bit number.
 *
 * @param {number} leftToken 32-bit token identifier.
 * @param {number} rightToken 32-bit token identifier.
 * @returns {BN} 64-bit market identifier.
 */
export function generateTokenPairing(leftToken: number, rightToken: number): BN {
    // Convert individual tokens to 32 bit numbers
    const leftTokenBuffer = new BN(leftToken).toArrayLike(Buffer, "be", 4);
    const rightTokenBuffer = new BN(rightToken).toArrayLike(Buffer, "be", 4);

    // Return the token pair as a 64 bit number
    return new BN(Buffer.concat([leftTokenBuffer, rightTokenBuffer]));
}
