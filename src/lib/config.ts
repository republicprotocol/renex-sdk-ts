import { Config, Options } from "../types";

const defaultConfig: Config = {
    network: "mainnet",
    autoNormalizeOrders: false,
};

export const generateConfig = (options?: Options): Config => {
    options = options || {};

    const conf = defaultConfig;
    if (options.network !== undefined) {
        conf.network = options.network;
    }
    if (options.autoNormalizeOrders !== undefined) {
        conf.autoNormalizeOrders = options.autoNormalizeOrders;
    }
    return conf;
};
