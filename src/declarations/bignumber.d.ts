import * as BigNumberLib from "bignumber.js";
import { BN } from "bn.js";

/**
 * The existing typings does not let you convert BN into BigNumber.
 * This typings declaration fixes this issue.
 */
declare module "bignumber.js" {
    export default class BigNumber extends BigNumberLib.BigNumber {
        constructor(n: BigNumberLib.BigNumber.Value | BN, base?: number);
    }
}