export const name = "balances.ts";

// import BigNumber from "bignumber.js";
// import BN from "bn.js";

// import { errors } from "../errors";

// export const adjustDecimals = (value: BN | BigNumber, fromDecimals: number, toDecimals: number): BN => {
//     if (BigNumber.isBigNumber(value) || value instanceof BigNumber) {
//         value = new BigNumber(value.toFixed());
//     } else {
//         value = new BigNumber(value.toString());
//     }

//     if (fromDecimals < toDecimals) {
//         return new BN(value.multipliedBy(new BigNumber(10).exponentiatedBy(toDecimals - fromDecimals)).toFixed());
//     } else {
//         const v = value.dividedBy(new BigNumber(10).exponentiatedBy(fromDecimals - toDecimals));
//         if (!v.integerValue(BigNumber.ROUND_FLOOR).eq(v)) {
//             // We have a floating point number which can't be converted to BN.
//             // This usually happens when the value passed in is too small.
//             throw new Error(`${errors.NumericalPrecision}: converting ${value} from ${fromDecimals} to ${toDecimals} decimals`);
//         }
//         return new BN(v.toFixed());
//     }
// };
