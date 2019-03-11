import BigNumber from "bignumber.js";
import BN from "bn.js";
import { NumberInput, Token, TokenDetails } from "../types";

export function toSmallestUnit(amount: NumberInput, tokenDetails: TokenDetails | number): BigNumber {
    let decimals: number;
    if (typeof tokenDetails === "number") {
        decimals = tokenDetails;
    } else {
        decimals = tokenDetails.decimals;
    }
    return new BigNumber(amount).times(new BigNumber(10).exponentiatedBy(decimals));
}

export function fromSmallestUnit(amount: NumberInput, tokenDetails: TokenDetails | number): BigNumber {
    let decimals: number;
    if (typeof tokenDetails === "number") {
        decimals = tokenDetails;
    } else {
        decimals = tokenDetails.decimals;
    }
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

/**
 * Split a 64-bit number into two 32-bit token identifiers.
 *
 * @param {BN} pair The 64-bit token pair.
 * @returns {[number, number]} Two 32-bit token identifiers.
 */
export function splitTokenPairing(pair: BN): [number, number] {
    const buffer = pair.toArrayLike(Buffer, "be", 8);
    const fstToken = new BN(buffer.slice(0, 4)).toNumber();
    const sndToken = new BN(buffer.slice(4, 8)).toNumber();
    return [fstToken, sndToken];
}
