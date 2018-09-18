import { BN } from "bn.js";

import { Options } from "../types";

export interface Config extends Options {
    minimumTradeVolume: BN;
}

export const defaultConfig: Config = {
    minimumTradeVolume: new BN(0),
};

export function generateConfig(options?: Options): Config {
    options = options || {};

    const conf = defaultConfig;
    if (options.minimumTradeVolume) {
        const volume = new BN(options.minimumTradeVolume);
        if (volume.gte(new BN(0))) {
            conf.minimumTradeVolume = volume;
        }
    }
    return conf;
}
