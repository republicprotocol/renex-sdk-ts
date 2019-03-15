import BigNumber from "bignumber.js";
import BN from "bn.js";
import { NumberInput, Token, TokenDetails } from "../types";

export const Tokens = new Map<Token, TokenDetails>()
    .set(Token.BTC, { symbol: Token.BTC, name: "Bitcoin", decimals: 8 })
    .set(Token.ETH, { symbol: Token.ETH, name: "Ethereum", decimals: 18 })
    .set(Token.TUSD, { symbol: Token.TUSD, name: "TrueUSD", decimals: 18 })
    .set(Token.DAI, { symbol: Token.DAI, name: "Dai", decimals: 18 })
    .set(Token.WBTC, { symbol: Token.WBTC, name: "Wrapped Bitcoin", decimals: 8 })
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

export function tokenToID(token: Token): number {
    switch (token) {
        case Token.BTC:
            return 0;
        case Token.ETH:
            return 1;
        case Token.DGX:
            return 256;
        case Token.TUSD:
            return 257;
        case Token.DAI:
            return 258;
        case Token.REN:
            return 65536;
        case Token.ZRX:
            return 65537;
        case Token.OMG:
            return 65538;
        case Token.WBTC:
            return 65539;
    }
    throw new Error(`Invalid token: ${token}`);
}

export function idToToken(token: number): Token {
    switch (token) {
        case 0:
            return Token.BTC;
        case 1:
            return Token.ETH;
        case 256:
            return Token.DGX;
        case 257:
            return Token.TUSD;
        case 65536:
            return Token.REN;
        case 65537:
            return Token.ZRX;
        case 65538:
            return Token.OMG;
        case 65539:
            return Token.WBTC;
    }
    throw new Error(`Invalid token ID: ${token}`);
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
