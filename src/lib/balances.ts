import BigNumber from "bignumber.js";
import { BN } from "bn.js";

import { ErrNumericalPrecision } from "./errors";
// import { Token, TokenDetails } from "./market";

export const adjustDecimals = (value: BN | BigNumber, fromDecimals: number, toDecimals: number): BN => {
    if (BigNumber.isBigNumber(value) || value instanceof BigNumber) {
        value = new BigNumber((value as BigNumber).toFixed());
    } else {
        value = new BigNumber(value.toString());
    }

    if (fromDecimals < toDecimals) {
        return new BN(value.multipliedBy(new BigNumber(10).exponentiatedBy(toDecimals - fromDecimals)).toFixed());
    } else {
        const v = value.dividedBy(new BigNumber(10).exponentiatedBy(fromDecimals - toDecimals));
        if (!v.integerValue(BigNumber.ROUND_FLOOR).eq(v)) {
            // We have a floating point number which can't be converted to BN.
            // This usually happens when the value passed in is too small.
            throw new Error(`${ErrNumericalPrecision}: converting ${value} from ${fromDecimals} to ${toDecimals} decimals`);
        }
        return new BN(v.toFixed());
    }
};

// /**
//  * Convert a token amount to the readable amount using the token decimals.
//  * @param {BigNumber} balance The balance represented as a BigNumber.
//  * @param {Token} token The token used to represented the balance.
//  */
// export const balanceToReadable = (balance: BigNumber, token: Token): BigNumber => {
//     const tokenDetails = TokenDetails.get(token);

//     if (balance === undefined) {
//         balance = new BigNumber(0);
//     }

//     const e = new BigNumber(10).pow(tokenDetails.digits);
//     balance = balance.div(e);

//     return balance;
// };

// /**
//  * Convert a readable amount to the token amount using the token decimals.
//  * @param {string} readable The amount represented as a string.
//  * @param {Token} token The token used to represent the amount.
//  */
// export const readableToBalance = (readable: string, token: Token): BigNumber => {
//     const tokenDetails = TokenDetails.get(token);

//     if (readable === undefined || readable === "") {
//         readable = "0";
//     }

//     let balance = new BigNumber(readable);

//     const e = new BigNumber(10).pow(tokenDetails.digits);
//     balance = balance.times(e);

//     return balance;
// };

// /**
//  * Removes excessive digits from a value for a given currency. Primarily used
//  * for user inputs.
//  * @param {BigNumber} amount The amount to be checked for excessive digits.
//  * @param {Token} token The token the digits should be checked against.
//  */
// export const removeExcessDigits = (amount: BigNumber, token: Token): BigNumber => {
//     const value = readableToBalance(amount.toFixed(), token).decimalPlaces(0);
//     return new BigNumber(balanceToReadable(value, token));
// };
