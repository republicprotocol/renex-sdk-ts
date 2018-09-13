import { BN } from "bn.js";

import RenExSDK, { BalanceAction, BalanceActionStatus, BalanceActionType, IdempotentKey, IntInput, TokenDetails } from "../index";

import { ERC20Contract } from "contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { ErrCanceledByUser, ErrInsufficientFunds, ErrUnimplemented } from "../lib/errors";
import { requestWithdrawalSignature } from "../lib/ingress";

export const tokenDetails = async (sdk: RenExSDK, token: number): Promise<TokenDetails> => {
    if (sdk.cachedTokenDetails.has(token)) {
        return sdk.cachedTokenDetails.get(token);
    }

    const detailsFromContract = await sdk.contracts.renExTokens.tokens(token);
    const details: TokenDetails = {
        address: detailsFromContract.addr,
        decimals: new BN(detailsFromContract.decimals).toNumber(),
        registered: detailsFromContract.registered,
    };

    sdk.cachedTokenDetails.set(token, details);

    return details;
};

export const nondepositedBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    if (token === 1) {
        return new BN(await sdk.web3.eth.getBalance(sdk.address));
    } else {
        const details = await sdk.tokenDetails(token);
        let tokenContract: ERC20Contract;
        if (!sdk.contracts.erc20.has(token)) {
            tokenContract = new (withProvider(sdk.web3, ERC20))(details.address);
            sdk.contracts.erc20.set(token, tokenContract);
        } else {
            tokenContract = sdk.contracts.erc20.get(token);
        }
        return new BN(await tokenContract.balanceOf(sdk.address));
    }
};

export const nondepositedBalances = (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    // Loop through all tokens, returning 0 for any that throw an error
    return Promise.all(tokens.map(async (token: number) => {
        try {
            return await nondepositedBalance(sdk, token);
        } catch (err) {
            console.error(`Unable to retrieve non-deposited balance for token #${token}`);
            return new BN(0);
        }
    }));
};

export const balance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    const details = await sdk.tokenDetails(token);
    return new BN(await sdk.contracts.renExBalances.traderBalances(sdk.address, details.address));
};

export const balances = (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    // Loop through all tokens, returning 0 for any that throw an error
    return Promise.all(tokens.map((async (token) => {
        try {
            return sdk.balance(token);
        } catch (err) {
            return new BN(0);
        }
    })));
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
): Promise<BalanceAction> => {
    value = new BN(value);

    // Trustless withdrawals are not implemented yet
    if (withoutIngressSignature === true || key !== undefined) {
        throw new Error(ErrUnimplemented);
    }

    const details = await sdk.tokenDetails(token);

    // TODO: Check balance

    const balanceAction: BalanceAction = {
        action: BalanceActionType.Withdraw,
        amount: value,
        time: Math.floor(new Date().getTime() / 1000),
        status: BalanceActionStatus.Pending,
        token,
        trader: sdk.address,
        txHash: "",
    };

    try {
        const signature = await requestWithdrawalSignature(sdk.networkData.ingress, sdk.address, token);
        const transaction = await sdk.contracts.renExBalances.withdraw(details.address, value, signature.toHex(), { from: sdk.address });

        // TODO: Store balanceAction before confirmation with on("transactionHash").

        // Update balance action
        balanceAction.status = BalanceActionStatus.Done;
        balanceAction.txHash = transaction.tx;

        sdk.storage.setBalanceAction(balanceAction).catch(console.error);

        return balanceAction;
    } catch (error) {
        if (error.tx) {
            balanceAction.txHash = error.tx;
            sdk.storage.setBalanceAction(balanceAction).catch(console.error);
            return balanceAction;
        }

        if (error.message.match("Insufficient funds")) {
            throw new Error(ErrInsufficientFunds);
        }
        if (error.message.match("User denied transaction signature")) {
            throw new Error(ErrCanceledByUser);
        }
        throw error;
    }
};
