import BigNumber from "bignumber.js";

import { Options } from "../types";

export interface Config extends Options {
    minTradeVolume: BigNumber;
}

export const defaultConfig: Config = {
    minTradeVolume: new BigNumber(0),
};

export function generateConfig(options?: Options): Config {
    options = options || {};

    const conf = defaultConfig;
    if (options.minTradeVolume) {
        const volume = new BigNumber(options.minTradeVolume);
        if (volume.gte(new BigNumber(0))) {
            conf.minTradeVolume = volume;
        }
    }
    return conf;
}
