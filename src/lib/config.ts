import { Config, Options } from "../types";

export const defaultConfig: Config = {
    network: "mainnet",
    autoNormalizeOrders: false,
    storageProvider: "none",
};

export function generateConfig(options?: Options): Config {
    options = options || {};

    const conf = defaultConfig;
    if (options.network !== undefined) {
        conf.network = options.network;
    }
    if (options.autoNormalizeOrders !== undefined) {
        conf.autoNormalizeOrders = options.autoNormalizeOrders;
    }
    if (options.storageProvider !== undefined) {
        conf.storageProvider = options.storageProvider;
    }
    return conf;
}
