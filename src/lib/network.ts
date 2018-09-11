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
            renExAtomicInfo: string;
        }
    ];
    tokens: {
        DGX: string;
        ABC: string;
        REN: string;
        PQR: string;
        XYZ: string;
    };
}
