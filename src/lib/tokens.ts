import RenExSDK from "../index";

import { BN } from "bn.js";
import { TokenCode } from "types";

export enum Token {
    BTC = "BTC",
    ETH = "ETH",
    DGX = "DGX",
    TUSD = "TUSD",
    REN = "REN",
    ZRX = "ZRX",
    OMG = "OMG",
}

export function supportedTokens(sdk: RenExSDK): Promise<TokenCode[]> {
    return Promise.resolve([Token.BTC, Token.ETH, Token.DGX, Token.TUSD, Token.REN, Token.ZRX, Token.OMG]);
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
