import { BN } from "bn.js";

import RenExSDK from "../index";

import { ERC20Contract } from "contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { BalanceActionType, OrderStatus, TokenDetails, TransactionStatus } from "../types";

export const tokenDetails = async (sdk: RenExSDK, token: number): Promise<TokenDetails> => {
    if (sdk._cachedTokenDetails.has(token)) {
        return sdk._cachedTokenDetails.get(token);
    }

    const detailsFromContract = await sdk._contracts.renExTokens.tokens(token);
    const details: TokenDetails = {
        address: detailsFromContract.addr,
        decimals: new BN(detailsFromContract.decimals).toNumber(),
        registered: detailsFromContract.registered,
    };

    sdk._cachedTokenDetails.set(token, details);

    return details;
};

export const nondepositedBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    if (token === 1) {
        return new BN(await sdk.web3().eth.getBalance(sdk.address()));
    } else {
        const details = await sdk.tokenDetails(token);
        let tokenContract: ERC20Contract;
        if (!sdk._contracts.erc20.has(token)) {
            tokenContract = new (withProvider(sdk.web3(), ERC20))(details.address);
            sdk._contracts.erc20.set(token, tokenContract);
        } else {
            tokenContract = sdk._contracts.erc20.get(token);
        }
        return new BN(await tokenContract.balanceOf(sdk.address()));
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
    return new BN(await sdk._contracts.renExBalances.traderBalances(sdk.address(), details.address));
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
    return usableBalances(sdk, [token]).then(b => b[0]);
};

export const usableBalances = async (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    const usedOrderBalances = sdk.listTraderOrders().then(orders => {
        const usedFunds = new Map<number, BN>();
        orders.forEach(order => {
            if (order.status === OrderStatus.NOT_SUBMITTED ||
                order.status === OrderStatus.OPEN ||
                order.status === OrderStatus.CONFIRMED) {
                const token = order.orderInputs.spendToken;
                const usedTokenBalance = usedFunds.get(token);
                if (usedTokenBalance) {
                    usedFunds.set(token, usedTokenBalance.add(order.computedOrderDetails.spendVolume));
                } else {
                    usedFunds.set(token, order.computedOrderDetails.spendVolume);
                }
            }
        });
        return usedFunds;
    });

    const pendingBalances = sdk.listBalanceActions().then(balanceActions => {
        const pendingFunds = new Map<number, BN>();
        balanceActions.forEach(action => {
            if (action.action === BalanceActionType.Withdraw && action.status === TransactionStatus.Pending) {
                const pendingTokenFunds = pendingFunds.get(action.token);
                if (pendingTokenFunds) {
                    pendingFunds.set(action.token, pendingTokenFunds.add(action.amount));
                } else {
                    pendingFunds.set(action.token, action.amount);
                }
            }
        });
        return pendingFunds;
    });

    return Promise.all([balances(sdk, tokens), usedOrderBalances, pendingBalances]).then(([
        startingBalance,
        orderBalance,
        withdrawnBalance,
    ]) => {
        tokens.forEach((token, index) => {
            const ob = orderBalance.get(token);
            if (ob) {
                startingBalance[index] = startingBalance[index].sub(ob);
            }
            const wb = withdrawnBalance.get(token);
            if (wb) {
                startingBalance[index] = startingBalance[index].sub(wb);
            }
        });
        return startingBalance;
    });
};
