import { Config, Options } from "../types";

export const defaultConfig: Config = {
    autoNormalizeOrders: false,
};

export function generateConfig(options?: Options): Config {
    options = options || {};

    const conf = defaultConfig;
    if (options.autoNormalizeOrders) {
        conf.autoNormalizeOrders = options.autoNormalizeOrders;
    }
    return conf;
}
