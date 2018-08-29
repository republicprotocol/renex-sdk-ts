import BigNumber from "bignumber.js";

import { getStep, normalizePrice, normalizeVolume, priceToTuple, tupleToPrice, tupleToVolume, volumeToTuple } from "@Library/conversion";
import { Tuple } from "@Library/ingress";

test("priceToTuple and tupleToPrice should be inverse functions for valid prices", () => {
    const testcases = [
        0.24, 0.00005555,
        1, 1000, 1115, 1110
    ];
    for (const n of testcases) {
        const bn = new BigNumber(n);
        expect(tupleToPrice(priceToTuple(bn))).toEqual(bn);
    }

    // Invalid prices:
    const invalidTestcases = [
        1111, 1111111
    ];
    for (const n of invalidTestcases) {
        const bn = new BigNumber(n);
        expect(tupleToPrice(priceToTuple(bn))).not.toEqual(bn);
    }
});

test("volumeToTuple and tupleToVolume should be inverse functions for valid volumes", () => {
    const testcases = [
        0.24, 12, 14, 2, 98, 0.00024,
        1, 1000, 140000000000
    ];
    for (const n of testcases) {
        const bn = new BigNumber(n);
        expect(tupleToVolume(volumeToTuple(bn))).toEqual(bn);
    }

    // Invalid volumes:
    const invalidTestcases = [
        1111, 1111111, 0.00005555, 1115, 1110, 11, 99,
    ];
    for (const n of invalidTestcases) {
        const bn = new BigNumber(n);
        expect(tupleToVolume(volumeToTuple(bn))).not.toEqual(bn);
    }
});

test("priceToTuple should calculate the corresponding tuple for any given price", () => {
    // TODO: Add more tests
    expect(priceToTuple(new BigNumber("0.0000095"))).toEqual(new Tuple({ c: 1900, q: 32 }));
    expect(priceToTuple(new BigNumber("0.0000000000000000095"))).toEqual(new Tuple({ c: 1900, q: 20 }));
    expect(priceToTuple(new BigNumber("1"))).toEqual(new Tuple({ c: 200, q: 38 }));

    expect(volumeToTuple(new BigNumber("0.000009400001"), false)).toEqual(new Tuple({ c: 48, q: 6 }));
});

test("normalizeVolume should round values to the correct increments", () => {
    expect(normalizeVolume(new BigNumber("5.3"))).toEqual(new BigNumber("5.2"));
    expect(normalizeVolume(new BigNumber("5.006"))).toEqual(new BigNumber("5"));
    expect(normalizeVolume(new BigNumber("0.63"))).toEqual(new BigNumber("0.62"));
    expect(normalizeVolume(new BigNumber("-5.3"))).toEqual(new BigNumber("NaN"));
    expect(normalizeVolume(new BigNumber("0"))).toEqual(new BigNumber("0"));
    expect(normalizeVolume(new BigNumber("10000000000000000"))).toEqual(new BigNumber("10000000000000000"));
});

test("normalizePrice should round values to the correct increments", () => {
    expect(normalizePrice(new BigNumber("5.3"))).toEqual(new BigNumber("5.3"));
    expect(normalizePrice(new BigNumber("5.006"))).toEqual(new BigNumber("5.005"));
    expect(normalizePrice(new BigNumber("-5.3"))).toEqual(new BigNumber("NaN"));
    expect(normalizePrice(new BigNumber("0"))).toEqual(new BigNumber("0"));
    expect(normalizePrice(new BigNumber("10000000000000000"))).toEqual(new BigNumber("10000000000000000"));
    expect(normalizePrice(new BigNumber("9999999999999999"))).toEqual(new BigNumber("9950000000000000"));
});

test("getStep should convert the step to the correct order of magnitude", () => {
    expect(getStep(new BigNumber("0.5"), 0.2)).toEqual("0.02");
    expect(getStep(new BigNumber("5"), 0.2)).toEqual("0.2");
    expect(getStep(new BigNumber("10"), 0.2)).toEqual("2");
    expect(getStep(new BigNumber("50"), 0.2)).toEqual("2");
    expect(getStep(new BigNumber("1000"), 0.2)).toEqual("200");
    expect(getStep(new BigNumber("10000000000000000"), 0.2)).toEqual("2000000000000000");
    expect(getStep(new BigNumber("-5"), 0.2)).toEqual("NaN");
});
