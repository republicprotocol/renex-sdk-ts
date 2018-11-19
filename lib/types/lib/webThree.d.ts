import Web3 from "web3";
export declare function getAccounts(web3: Web3): Promise<string[]>;
export declare function getNetwork(web3: Web3): Promise<string>;
export declare function getBalance(web3: Web3, address: string): Promise<number>;
