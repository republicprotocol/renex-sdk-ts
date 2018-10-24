import { Config, Options } from "../types";

export const defaultConfig: Config = {
    autoNormalizeOrders: false,
    storageProvider: "localStorage",
};

export function generateConfig(options?: Options): Config {
    options = options || {};

    const conf = defaultConfig;
    if (options.autoNormalizeOrders !== undefined) {
        conf.autoNormalizeOrders = options.autoNormalizeOrders;
    }
    if (options.storageProvider !== undefined) {
        conf.storageProvider = options.storageProvider;
    }
    return conf;
}
