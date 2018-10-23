import BigNumber from "bignumber.js";

import { normalizePrice, normalizeVolume, priceToTuple, tupleToPrice, tupleToVolume, volumeToTuple } from "../../src/lib/conversion";
import { Tuple } from "../../src/lib/ingress";

import { expect } from "chai";
import "mocha";

// tslint:disable:no-unused-expression

it("priceToTuple and tupleToPrice should be inverse functions for valid prices", () => {
    const testCases = [
        0.24, 0.00005555,
        1, 1000, 1115, 1110
    ];
    for (const n of testCases) {
        const bn = new BigNumber(n);
        expect(tupleToPrice(priceToTuple(bn))).to.deep.equal(bn);
    }

    // Invalid prices:
    const invalidTestCases = [
        1111, 1111111
    ];
    for (const n of invalidTestCases) {
        const bn = new BigNumber(n);
        expect(tupleToPrice(priceToTuple(bn))).not.to.deep.equal(bn);
    }
});

it("volumeToTuple and tupleToVolume should be inverse functions for valid volumes", () => {
    const testCases = [
        0.24, 12, 14, 2, 98, 0.00024,
        1, 1000, 140000000000
    ];
    for (const n of testCases) {
        const bn = new BigNumber(n);
        expect(tupleToVolume(volumeToTuple(bn))).to.deep.equal(bn);
    }

    // Invalid volumes:
    const invalidTestCases = [
        1111, 1111111, 0.00005555, 1115, 1110, 11, 99,
    ];
    for (const n of invalidTestCases) {
        const bn = new BigNumber(n);
        expect(tupleToVolume(volumeToTuple(bn))).not.to.deep.equal(bn);
    }
});

it("priceToTuple should calculate the corresponding tuple for any given price", () => {
    // TODO: Add more tests
    expect(priceToTuple(new BigNumber("0.0000095"))).to.deep.equal(new Tuple({ c: 1900, q: 32 }));
    expect(priceToTuple(new BigNumber("0.0000000000000000095"))).to.deep.equal(new Tuple({ c: 1900, q: 20 }));
    expect(priceToTuple(new BigNumber("1"))).to.deep.equal(new Tuple({ c: 200, q: 38 }));

    expect(volumeToTuple(new BigNumber("0.000009400001"), true)).to.deep.equal(new Tuple({ c: 48, q: 6 }));
});

it("normalizeVolume should round values to the correct increments", () => {
    expect(normalizeVolume(new BigNumber("5.3"))).to.deep.equal(new BigNumber("5.2"));
    expect(normalizeVolume(new BigNumber("5.006"))).to.deep.equal(new BigNumber("5"));
    expect(normalizeVolume(new BigNumber("0.63"))).to.deep.equal(new BigNumber("0.62"));
    expect(normalizeVolume(new BigNumber("-5.3"))).to.deep.equal(new BigNumber("NaN"));
    expect(normalizeVolume(new BigNumber("0"))).to.deep.equal(new BigNumber("0"));
    expect(normalizeVolume(new BigNumber("10000000000000000"))).to.deep.equal(new BigNumber("10000000000000000"));
});

it("normalizePrice should round values to the correct increments", () => {
    expect(normalizePrice(new BigNumber("5.3"))).to.deep.equal(new BigNumber("5.3"));
    expect(normalizePrice(new BigNumber("5.006"))).to.deep.equal(new BigNumber("5.005"));
    expect(normalizePrice(new BigNumber("-5.3"))).to.deep.equal(new BigNumber("NaN"));
    expect(normalizePrice(new BigNumber("0"))).to.deep.equal(new BigNumber("0"));
    expect(normalizePrice(new BigNumber("10000000000000000"))).to.deep.equal(new BigNumber("10000000000000000"));
    expect(normalizePrice(new BigNumber("9999999999999999"))).to.deep.equal(new BigNumber("9950000000000000"));
});
