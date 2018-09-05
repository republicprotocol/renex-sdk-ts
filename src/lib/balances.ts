import BigNumber from "bignumber.js";
import { BN } from "bn.js";

import { Token, TokenDetails } from "@Lib/market";
import { FloatInput, IntInput } from "index";

export const adjustDecimals = (value: IntInput | FloatInput, fromDecimals: string | number | BN, toDecimals: string | number | BN): BN => {
    fromDecimals = new BN(fromDecimals).toNumber();
    toDecimals = new BN(toDecimals).toNumber();

    if ((value as any)._isBigNumber) {
        value = new BigNumber((value as any).toFixed());
    } else {
        value = new BigNumber(value.toString());
    }

    if (fromDecimals < toDecimals) {
        return new BN(value.multipliedBy(new BigNumber(10).exponentiatedBy(toDecimals - fromDecimals)).toFixed());
    } else {
        return new BN(value.dividedBy(new BigNumber(10).exponentiatedBy(fromDecimals - toDecimals)).toFixed());
    }
};

/**
 * Convert a token amount to the readable amount using the token decimals.
 * @param balance The balance represented as a BigNumber.
 * @param token The token used to represented the balance.
 */
export const balanceToReadable = (balance: BigNumber, token: Token): BigNumber => {
    const tokenDetails = TokenDetails.get(token);

    if (balance === undefined) {
        balance = new BigNumber(0);
    }

    const e = new BigNumber(10).pow(tokenDetails.digits);
    balance = balance.div(e);

    return balance;
};

/**
 * Convert a readable amount to the token amount using the token decimals.
 * @param readable The amount represented as a string.
 * @param token The token used to represent the amount.
 */
export const readableToBalance = (readable: string, token: Token): BigNumber => {
    const tokenDetails = TokenDetails.get(token);

    if (readable === undefined || readable === "") {
        readable = "0";
    }

    let balance = new BigNumber(readable);

    const e = new BigNumber(10).pow(tokenDetails.digits);
    balance = balance.times(e);

    return balance;
};

/**
 * Removes excessive digits from a value for a given currency. Primarily used
 * for user inputs.
 * @param amount The amount to be checked for excessive digits.
 * @param token The token the digits should be checked against.
 */
export const removeExcessDigits = (amount: BigNumber, token: Token): BigNumber => {
    const value = readableToBalance(amount.toFixed(), token).decimalPlaces(0);
    return new BigNumber(balanceToReadable(value, token));
};
