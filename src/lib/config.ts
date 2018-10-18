import BigNumber from "bignumber.js";

import { Options } from "../types";

export interface Config extends Options {
    minimumTradeVolume: BigNumber;
}

export const defaultConfig: Config = {
    minimumTradeVolume: new BigNumber(0),
};

export function generateConfig(options?: Options): Config {
    options = options || {};

    const conf = defaultConfig;
    if (options.minimumTradeVolume) {
        const volume = new BigNumber(options.minimumTradeVolume);
        if (volume.gte(new BigNumber(0))) {
            conf.minimumTradeVolume = volume;
        }
    }
    return conf;
}
