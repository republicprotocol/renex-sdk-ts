import mainnet from "./networks/mainnet.json";
import testnet from "./networks/testnet.json";

export interface NetworkData {
    network: string;
    ingress: string;
    infura: string;
    etherscan: string;
    wbtcKYCServer: string;
    ethNetwork: string;
    ethNetworkLabel: string;
    ethNetworkId: number;
    contracts: [
        {
            darknodeRegistry: string;
        }
    ];
}

export const networks = {
    mainnet: mainnet as NetworkData,
    testnet: testnet as NetworkData,
};
