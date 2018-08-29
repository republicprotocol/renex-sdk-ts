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
            renExBalances: string;
            renExSettlement: string;
            atomicInfo: string;
        }
    ];
    tokens: {
        DGX: string;
        REN: string;
        ABC: string;
        XYZ: string;
    };
}

export const NetworkData: NetworkData = NETWORK;