import isNode from "detect-node";
import os from "os";
import path from "path";

import { Config, Options } from "../types";

const defaultStorageProvider = (): string => {
    if (isNode) {
        // We will store data in "~/.renex" by default if in a Node environment
        return path.join(os.homedir(), ".renex");
    } else {
        // We're in a browser (probably) so use localStorage
        return "localStorage";
    }
};

const defaultConfig: Config = {
    network: "mainnet",
    autoNormalizeOrders: false,
    storageProvider: defaultStorageProvider(),
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
