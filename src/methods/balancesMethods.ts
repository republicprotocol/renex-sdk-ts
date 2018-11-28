import BigNumber from "bignumber.js";

import RenExSDK from "../index";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, withProvider } from "../contracts/contracts";
import { fromSmallestUnit, tokenToID } from "../lib/tokens";
import { BalanceActionType, BalanceDetails, OrderSettlement, OrderStatus, Token, TokenCode, TokenDetails, TransactionStatus } from "../types";
import { fetchBalanceActions, fetchTraderOrders } from "./storageMethods";

type MaybeBigNumber = BigNumber | null;

export const getTokenDetails = async (sdk: RenExSDK, token: TokenCode): Promise<TokenDetails> => {
    let detailsFromContract = await sdk._cachedTokenDetails.get(token);

    if (!detailsFromContract) {
        const detailsPromise = sdk._contracts.renExTokens.tokens(tokenToID(token));
        sdk._cachedTokenDetails.set(token, detailsPromise);
        detailsFromContract = await detailsPromise;
    }

    const details: TokenDetails = {
        address: detailsFromContract.addr,
        decimals: new BigNumber(detailsFromContract.decimals).toNumber(),
        registered: detailsFromContract.registered,
    };

    return details;
};

const nondepositedBalance = async (sdk: RenExSDK, token: TokenCode): Promise<BigNumber> => {
    const details = await getTokenDetails(sdk, token);
    let balance = new BigNumber(0);
    if (token === Token.ETH) {
        balance = new BigNumber(await sdk.getWeb3().eth.getBalance(sdk.getAddress()));
    } else {
        let tokenContract: ERC20Contract | undefined = sdk._contracts.erc20.get(token);
        if (!tokenContract) {
            tokenContract = new (withProvider(sdk.getWeb3().currentProvider, ERC20))(details.address);
            sdk._contracts.erc20.set(token, tokenContract);
        }
        balance = new BigNumber(await tokenContract.balanceOf(sdk.getAddress()));
    }
    return fromSmallestUnit(balance, details);
};

const nondepositedBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<MaybeBigNumber[]> => {
    // Loop through all tokens, returning null for any that throw an error
    return Promise.all(tokens.map((token: TokenCode) => nondepositedBalance(sdk, token).catch((error) => {
        console.error(`Failed to get non deposited balance for ${token}: ${error}`);
        return null;
    })));
};

const totalBalance = async (sdk: RenExSDK, token: TokenCode): Promise<BigNumber> => {
    const details = await getTokenDetails(sdk, token);
    const balance = new BigNumber(await sdk._contracts.renExBalances.traderBalances(sdk.getAddress(), details.address));
    return fromSmallestUnit(balance, details);
};

const totalBalances = (sdk: RenExSDK, tokens: TokenCode[]): Promise<MaybeBigNumber[]> => {
    // Loop through all tokens, returning null for any that throw an error
    return Promise.all(tokens.map((async (token) => totalBalance(sdk, token).catch((err) => {
        console.error(`Failed to get balance for ${token}: ${err}`);
        return null;
    }))));
};

const lockedBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<BigNumber[]> => {

    // Add balances from orders that are open or not settled
    const usedOrderBalancesPromise = fetchTraderOrders(sdk).then(orders => {
        const usedFunds = new Map<TokenCode, BigNumber>();
        orders.forEach(order => {
            if (order.status === OrderStatus.NOT_SUBMITTED ||
                order.status === OrderStatus.OPEN ||
                order.status === OrderStatus.CONFIRMED
            ) {
                if (order.computedOrderDetails.orderSettlement === OrderSettlement.RenEx) {
                    const token = order.computedOrderDetails.spendToken;
                    const usedTokenBalance = usedFunds.get(token);
                    if (usedTokenBalance) {
                        usedFunds.set(token, usedTokenBalance.plus(order.computedOrderDetails.spendVolume));
                    } else {
                        usedFunds.set(token, order.computedOrderDetails.spendVolume);
                    }
                } else {
                    // Include atomic swap fees in usable balance calculation
                    const token = order.computedOrderDetails.feeToken;
                    const feeTokenBalance = usedFunds.get(token);
                    if (feeTokenBalance) {
                        usedFunds.set(token, feeTokenBalance.plus(order.computedOrderDetails.feeAmount));
                    } else {
                        usedFunds.set(token, order.computedOrderDetails.feeAmount);
                    }
                }
            }
        });
        return usedFunds;
    });

    // Add balances from pending withdrawals
    const pendingBalancesPromise = fetchBalanceActions(sdk).then(balanceActions => {
        const pendingFunds = new Map<TokenCode, BigNumber>();
        balanceActions.forEach(action => {
            if (action.action === BalanceActionType.Withdraw && action.status === TransactionStatus.Pending) {
                const pendingTokenFunds = pendingFunds.get(action.token);
                if (pendingTokenFunds) {
                    pendingFunds.set(action.token, pendingTokenFunds.plus(action.amount));
                } else {
                    pendingFunds.set(action.token, action.amount);
                }
            }
        });
        return pendingFunds;
    });

    const [usedOrderBalances, pendingBalances] = await Promise.all([usedOrderBalancesPromise, pendingBalancesPromise]);

    return tokens.map(token => {
        const usedOrderBalance = usedOrderBalances.get(token) || new BigNumber(0);
        const pendingBalance = pendingBalances.get(token) || new BigNumber(0);
        return usedOrderBalance.plus(pendingBalance);
    });
};

export const balances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<Map<TokenCode, BalanceDetails>> => {
    const balanceDetails = new Map<TokenCode, BalanceDetails>();
    try {
        await Promise.all([
            totalBalances(sdk, tokens),
            lockedBalances(sdk, tokens),
            nondepositedBalances(sdk, tokens)
        ]).then(([total, locked, nondeposited]) => {
            tokens.forEach((token, index) => {
                const tokenBalance = total[index];
                const tokenLocked = locked[index];
                let usable: MaybeBigNumber = null;
                if (tokenBalance !== null) {
                    usable = BigNumber.max(tokenBalance.minus(tokenLocked), 0);
                }
                balanceDetails.set(token, {
                    free: usable,
                    used: tokenLocked,
                    nondeposited: nondeposited[index],
                });
            });
        });
    } catch (error) {
        console.error(error);
    }
    return balanceDetails;
};
