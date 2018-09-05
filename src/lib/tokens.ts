import { BN } from "bn.js";

export enum Token {
    BTC = 0,
    ETH = 1,
    DGX = 256,
    REN = 65536,
    ABC = 65537,
    XYZ = 65538,
}

/**
 * Combine buy and sell tokens into a single 64-bit number
 *
 * @param {number} buyToken 32-bit buy token identifier
 * @param {number} sellToken 32-bit sell token identifier
 * @returns {BN} 64-bit market identifier
 */
export function generateTokenPairing(buyToken: number, sellToken: number): BN {
    let lowPriority;
    let highPriority;
    if (buyToken < sellToken) {
        lowPriority = buyToken;
        highPriority = sellToken;
    } else {
        lowPriority = sellToken;
        highPriority = buyToken;
    }
    // Convert individual tokens to 32 bit numbers
    const lowPriorityToken = new BN(lowPriority).toArrayLike(Buffer, "be", 4);
    const highPriorityToken = new BN(highPriority).toArrayLike(Buffer, "be", 4);
    // Return the token pair as a 64 bit number
    return new BN(Buffer.concat([highPriorityToken, lowPriorityToken], 8).toString("hex"), 2);
}
