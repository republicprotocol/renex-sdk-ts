import BigNumber from "bignumber.js";

import { Tuple } from "./ingress";

/**
 * Calculate price tuple from a decimal string
 *
 * https://github.com/republicprotocol/republic-go/blob/smpc/docs/orders-and-order-fragments.md
 *
 */
export function priceToTuple(price: BigNumber): Tuple {
    const shift = 10 ** 12;
    const exponentOffset = 26;
    const step = 0.005;
    const tuple = floatToTuple(shift, exponentOffset, step, price, 1999);
    console.assert(0 <= tuple.c && tuple.c <= 1999, `Expected c (${tuple.c}) to be in [0,1999] in priceToTuple(${price})`);
    console.assert(0 <= tuple.q && tuple.q <= 52, `Expected q (${tuple.q}) to be in [0,52] in priceToTuple(${price})`);
    return tuple;
}

export const tupleToPrice = (t: Tuple): BigNumber => {
    const e = new BigNumber(10).pow(t.q - 26 - 12 - 3);
    return new BigNumber(t.c).times(5).times(e);
};

export const normalizePrice = (p: BigNumber): BigNumber => {
    return tupleToPrice(priceToTuple(p));
};

export function volumeToTuple(volume: BigNumber, roundDown = true): Tuple {
    const shift = 10 ** 12;
    const exponentOffset = 0;
    const step = 0.2;
    const tuple = floatToTuple(shift, exponentOffset, step, volume, 49, roundDown);
    console.assert(0 <= tuple.c && tuple.c <= 49, `Expected c (${tuple.c}) to be in [0,49] in volumeToTuple(${volume})`);
    console.assert(0 <= tuple.q && tuple.q <= 52, `Expected q (${tuple.q}) to be in [0,52] in volumeToTuple(${volume})`);
    return tuple;
}

export const tupleToVolume = (t: Tuple): BigNumber => {
    const e = new BigNumber(10).pow(t.q - 12);
    return new BigNumber(t.c).times(0.2).times(e);
};

export const normalizeVolume = (v: BigNumber, roundDown = true): BigNumber => {
    return tupleToVolume(volumeToTuple(v, roundDown));
};

function floatToTuple(shift: number, exponentOffset: number, step: number, value: BigNumber, max: number, roundDown = true): Tuple {
    const shifted = value.times(shift);

    const digits = -Math.floor(Math.log10(step)) + 1;
    const stepInt = step * 10 ** (digits - 1);

    // CALCULATE tuple
    let [c, exp] = significantDigits(shifted, digits, false, roundDown);
    if (roundDown) {
        c = (c - (c % stepInt)) / step;
    } else {
        c = (c + ((stepInt - (c % stepInt)) % stepInt)) / step;
    }

    // Simplify again if possible - e.g. [1910,32] becomes [191,33]
    let expAdd;
    [c, expAdd] = significantDigits(new BigNumber(c), digits, false, roundDown);
    exp += expAdd;

    // TODO: Fixme
    while (c > max) {
        c /= 10;
        exp++;
    }

    const q = exponentOffset + exp;

    return new Tuple({ c, q });
}

function significantDigits(n: BigNumber, digits: number, simplify = false, roundDown = true) {
    if (n.isEqualTo(0)) {
        return [0, 0];
    }
    let exp = Math.floor(Math.log10(n.toNumber())) - (digits - 1);
    const pow = new BigNumber(10).exponentiatedBy(new BigNumber(exp).toNumber());

    let c;
    if (roundDown) {
        c = Math.floor(n.div(pow.toNumber()).toNumber());
    } else {
        c = Math.ceil(n.div(pow.toNumber()).toNumber());
    }

    if (simplify) {
        while (c % 10 === 0 && c !== 0) {
            c = c / 10;
            exp++;
        }
    }
    return [c, exp];
}
