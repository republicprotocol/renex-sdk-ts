import BigNumber from "bignumber.js";
import Web3 from "web3";
import { BN } from "bn.js";
import RenExSDK from "@Root/index";
import { Token } from "@Lib/market";
/**
 * Convert a readable amount to the token amount using the token decimals.
 * @param readable The amount represented as a string.
 * @param token The token used to represent the amount.
 */
export declare const readableToBalance: (sdk: RenExSDK, readable: BigNumber, token: Token) => Promise<BN>;
export declare const deposit: (sdk: RenExSDK, token: number, valueBig: BigNumber) => Promise<void>;
export declare const MetaMask: {
    name: string;
    slug: string;
    description: string;
    enabled: boolean;
    getWeb3: () => Promise<Web3>;
    selectAccount: (web3: Web3) => Promise<string>;
    sign: (web3: Web3, data: string, address: string) => Promise<any>;
    sendTransactions: (calls: any[], onHash: any, onReceipt: any) => Promise<never>;
};
export declare function getAccounts(web3: Web3): Promise<string[]>;
export declare function getNetwork(web3: Web3): Promise<string>;
export declare function getBalance(web3: Web3, address: string): Promise<number>;
