import { BN } from "bn.js";

import RenExSDK, { IdempotentKey, IntInput } from "../index";

import { ERC20Contract } from "contracts/bindings/erc20";
import { ERC20, RenExBalances, RenExTokens, withProvider } from "../contracts/contracts";
import { ErrUnimplemented } from "../lib/errors";
import { requestWithdrawalSignature } from "../lib/ingress";
import { NetworkData } from "../lib/network";

export const nondepositedBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await withProvider(sdk.web3, RenExTokens).at(NetworkData.contracts[0].renExTokens);

    if (token === 1) {
        return new BN(await sdk.web3.eth.getBalance(sdk.address));
    } else {
        const tokenDetails = (await sdk.contracts.renExTokens.tokens(token));
        let tokenContract: ERC20Contract;
        if (!sdk.contracts.erc20.has(token)) {
            tokenContract = await withProvider(sdk.web3, ERC20).at(tokenDetails.addr);
            sdk.contracts.erc20.set(token, tokenContract);
        } else {
            tokenContract = sdk.contracts.erc20.get(token);
        }
        return new BN(await tokenContract.balanceOf(sdk.address));
    }
};

export const nondepositedBalances = async (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    return Promise.all(tokens.map(token => nondepositedBalance(sdk, token)));
};

export const balance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    sdk.contracts.renExBalances = sdk.contracts.renExBalances || await withProvider(sdk.web3, RenExBalances).at(NetworkData.contracts[0].renExBalances);
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await withProvider(sdk.web3, RenExTokens).at(NetworkData.contracts[0].renExTokens);

    const tokenString = (await sdk.contracts.renExTokens.tokens(token)).addr;

    return new BN(await sdk.contracts.renExBalances.traderBalances(sdk.address, tokenString));
};

export const balances = async (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    sdk.contracts.renExBalances = sdk.contracts.renExBalances || await withProvider(sdk.web3, RenExBalances).at(NetworkData.contracts[0].renExBalances);
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await withProvider(sdk.web3, RenExTokens).at(NetworkData.contracts[0].renExTokens);

    const tokenInfoPromises = tokens.map(token => sdk.contracts.renExTokens.tokens(token));
    const infos = await Promise.all(tokenInfoPromises);
    const balancePromises = infos.map(info => sdk.contracts.renExBalances.traderBalances(sdk.address, info.addr));
    const tokenBalances = await Promise.all(balancePromises);
    return tokenBalances.map(tokenBalance => new BN(tokenBalance));
};

export const usableBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    // TODO: Subtract balances locked up in orders
    return balance(sdk, token);
};

export const usableBalances = async (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    // TODO: Subtract balances locked up in orders
    return balances(sdk, tokens);
};

export const withdraw = async (
    sdk: RenExSDK, token: number, value: IntInput, withoutIngressSignature: boolean, key?: IdempotentKey
): Promise<IdempotentKey | void> => {

    // Trustless withdrawals are not implemented yet
    if (withoutIngressSignature === true || key !== undefined) {
        throw new Error(ErrUnimplemented);
    }

    sdk.contracts.renExBalances = sdk.contracts.renExBalances || await withProvider(sdk.web3, RenExBalances).at(NetworkData.contracts[0].renExBalances);
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await withProvider(sdk.web3, RenExTokens).at(NetworkData.contracts[0].renExTokens);

    const tokenString = (await sdk.contracts.renExTokens.tokens(token)).addr;

    // TODO: Check balance

    const signature = await requestWithdrawalSignature(sdk.address, token);
    await sdk.contracts.renExBalances.withdraw(tokenString, value, signature.toHex(), { from: sdk.address });
};
