import BigNumber from "bignumber.js";

import { NumberInput } from "../types";

export const normalizePrice = (input: BigNumber, roundUp?: boolean): BigNumber => {
    return input.decimalPlaces(8, roundUp ? BigNumber.ROUND_UP : BigNumber.ROUND_DOWN);
};

export const normalizeVolume = (input: BigNumber, roundUp?: boolean): BigNumber => {
    return input.decimalPlaces(8, roundUp ? BigNumber.ROUND_UP : BigNumber.ROUND_DOWN);
};

export function toOriginalType(converted: BigNumber, original: NumberInput): NumberInput {
    if (BigNumber.isBigNumber(original)) {
        return converted;
    }
    switch (typeof original) {
        case "number":
            return converted.toNumber();
        case "string":
            return converted.toFixed();
        default:
            throw new Error(`Could not convert ${typeof original} to original type`);
    }
}
