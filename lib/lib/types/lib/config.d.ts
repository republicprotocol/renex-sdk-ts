import { BN } from "bn.js";
import { Options } from "../types";
export interface Config extends Options {
    minimumTradeVolume: BN;
}
export declare const defaultConfig: Config;
export declare function generateConfig(options?: Options): Config;
