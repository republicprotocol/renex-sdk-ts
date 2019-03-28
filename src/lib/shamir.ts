import BN from "bn.js";
import crypto from "crypto";
import { List } from "immutable";

export const PRIME: BN = new BN("18446744073709551359");

export class Share {
    public index: number;
    public value: BN;
    public constructor(index: number, value: BN) {
        this.index = index;
        this.value = value;
    }
}

/**
 * Split a secret into shares using the finite field defined by the PRIME
 * constant. The secret must be less than, or equal to, the PRIME constant.
 * @param {number} n The number of shares that the secret will be split into.
 * @param {number} k The number of shares required to reconstruct the secret.
 * @param {BN} secret The secret number that will be split into shares.
 * @returns {List<Share>} An immutable list of shares.
 */
export const split = (n: number, k: number, secret: BN): List<Share> => {
    if (n < k) {
        throw new Error(`n-k error: n = ${n}, k = ${k}`);
    }
    if (PRIME.lte(secret)) {
        throw new Error("finite field error: secret is too big");
    }

    const coefficients = new Array<BN>(k);
    coefficients[0] = secret;

    for (let i = 1; i < k; i++) {
        // 8 bytes for a 64-bit number
        const coefficientSize = 64;
        let coefficient = new BN(0);
        do {
            coefficient = new BN(crypto.randomBytes(coefficientSize / 8));
        } while (coefficient.gte(PRIME));
        coefficients[i] = coefficient;
    }

    const shares = new Array(k);
    for (let x = 1; x <= n; x++) {

        let accumulator = coefficients[0];
        const base = new BN(x);
        let exp = base.mod(PRIME);

        for (let j = 1; j < coefficients.length; j++) {
            const co = coefficients[j].mul(exp).mod(PRIME);
            accumulator = accumulator.add(co).mod(PRIME);
            exp = exp.mul(base).mod(PRIME);
        }
        shares[x - 1] = new Share(x, accumulator);
    }

    return List(shares);
};

/**
 * Join shares into a secret using the finite field defined by the PRIME
 * constant. This function cannot determine the minimum number of shares
 * required.
 * @param {List<Share>} shares An immutable list of shares that will be used to
 *        reconstruct the secret.
 * @returns {BN} The reconstructed secret, or meaningless garbage when an
 *          insufficient number of shares is provided.
 */
export const join = (shares: List<Share>): BN => {
    let secret = new BN(0);
    for (let i = 0; i < shares.size; i++) {
        let num = new BN(1);
        let den = new BN(1);

        for (let j = 0; j < shares.size; j++) {
            if (i === j) {
                continue;
            }
            const startShare = shares.get(i);
            if (startShare === undefined) {
                throw new Error("accessing invalid share");
            }
            const start = new BN(startShare.index);
            const nextShare = shares.get(j);
            if (nextShare === undefined) {
                throw new Error("accessing invalid share");
            }
            const next = new BN(nextShare.index);

            const nextGen = num.mul(next).mod(PRIME);
            num = PRIME.sub(nextGen);

            const nextDiff = start.sub(next).mod(PRIME);
            den = den.mul(nextDiff).mod(PRIME);
        }

        den = den.invm(PRIME);

        const share = shares.get(i);
        if (share === undefined) {
            throw new Error("accessing invalid share");
        }
        let value = share.value.mul(num).mod(PRIME);
        value = value.mul(den).mod(PRIME);
        secret = secret.add(value).mod(PRIME);
    }

    return secret;
};
