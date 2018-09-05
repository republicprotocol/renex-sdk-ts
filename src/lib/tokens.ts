import { BN } from "bn.js";

export enum Token {
    BTC = 0,
    ETH = 1,
    DGX = 256,
    REN = 65536,
    ABC = 65537,
    XYZ = 65538,
}

export function GenerateTokenPairing(buyToken: number, sellToken: number): BN {
    let lowP;
    let highP;
    if (buyToken < sellToken) {
        lowP = buyToken;
        highP = sellToken;
    } else {
        lowP = sellToken;
        highP = buyToken;
    }
    // Convert individual tokens to 32 bit numbers
    const lowTok = new BN(lowP).toArrayLike(Buffer, "be", 4);
    const highTok = new BN(highP).toArrayLike(Buffer, "be", 4);
    // Return the token pair as a 64 bit number
    return new BN(Buffer.concat([highTok, lowTok], 8).toString("hex"), 2);
}
