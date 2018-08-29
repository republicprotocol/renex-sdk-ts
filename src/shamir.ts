import { BN } from "bn.js";
import { List } from "immutable";
import * as crypto from "crypto";

export const PRIME: BN = new BN("17012364981921935471");

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
 * @param n The number of shares that the secret will be split into.
 * @param k The number of shares required to reconstruct the secret.
 * @param secret The secret number that will be split into shares.
 * @returns An immutable list of shares.
 */
export function split(n: number, k: number, secret: BN): List<Share> {
    if (n < k) {
        throw new Error(`n-k error: n = ${n}, k = ${k}`);
    }
    if (PRIME.lte(secret)) {
        throw new Error("finite field error: secret is too big");
    }

    const coefficients = new Array(k);
    coefficients[0] = secret;

    for (let i = 1; i < k; i++) {
        let coefficient = new BN(0);
        const words = new Int32Array(2);
        do {
            const bytes = crypto.randomBytes(words.length);
            words.set(bytes);
            coefficient = new BN(Math.abs(words[0])).pow(new BN(2)).add(new BN(Math.abs(words[1])));
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

    const shareList = List(shares);
    return shareList;
}

/**
 * Join shares into a secret using the finite field defined by the PRIME
 * constant. This function cannot determine the minimum number of shares
 * required.
 * @param shares An immutable list of shares that will be used to reconstruct
 *               the secret.
 * @returns The reconstructed secret, or meaningless garbage when an
 *          insufficient number of shares is provided.
 */
export function join(shares: List<Share>): BN {
    let secret = new BN(0);
    for (let i = 0; i < shares.size; i++) {
        let num = new BN(1);
        let den = new BN(1);

        for (let j = 0; j < shares.size; j++) {
            if (i === j) {
                continue;
            }
            const start = new BN(shares.get(i).index);
            const next = new BN(shares.get(j).index);

            const nextGen = num.mul(next).mod(PRIME);
            num = PRIME.sub(nextGen);

            const nextDiff = start.sub(next).mod(PRIME);
            den = den.mul(nextDiff).mod(PRIME);
        }

        den = den.invm(PRIME);
        let value = shares.get(i).value.mul(num).mod(PRIME);
        value = value.mul(den).mod(PRIME);
        secret = secret.add(value).mod(PRIME);
    }

    return secret;
}