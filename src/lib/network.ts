import * as mainnet from "./networks/mainnet.json";
import * as testnet from "./networks/testnet.json";

export interface NetworkData {
    network: string;
    ingress: string;
    infura: string;
    etherscan: string;
    ethNetwork: string;
    ethNetworkLabel: string;
    ledgerNetworkId: number;
    contracts: [
        {
            darknodeRegistry: string;
            orderbook: string;
            renExTokens: string;
            renExBalances: string;
            renExSettlement: string;
            wyre: string;
        }
    ];
    tokens: {
        DGX: string;
        TUSD: string;
        REN: string;
        OMG: string;
        ZRX: string;
    };
}

export const networks = {
    mainnet: mainnet as NetworkData,
    testnet: testnet as NetworkData,
};
