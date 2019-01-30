import BigNumber from "bignumber.js";

import RenExSDK, { TokenCode } from "../index";

import { errors, updateError } from "../errors";
import { EncodedData } from "../lib/encodedData";
import { _authorizeSwapperd } from "../lib/ingress";
import { MarketPairs } from "../lib/market";
import { fetchSwapperAddress, fetchSwapperStatus, fetchSwapperVersion, findMatchingSwapReceipt, getSwapperdAddresses, getSwapperdBalances, submitSwap, SwapBlob, SwapperConnectionStatus, SwapReceipt, SwapStatus } from "../lib/swapper";
import { fromSmallestUnit, toSmallestUnit } from "../lib/tokens";
import { OrderInputsAll, OrderSettlement, OrderSide, OrderStatus, SwapperdBalanceDetails, SwapperdConnectionStatus, Token } from "../types";
import { getTokenDetails } from "./balancesMethods";
import { darknodeFees } from "./settlementMethods";
import { fetchTraderOrders } from "./storageMethods";

/* Swapperd Connection */

type MaybeBigNumber = BigNumber | null;

export const currentSwapperdConnectionStatus = (sdk: RenExSDK): SwapperdConnectionStatus => {
    return sdk._swapperdConnectionStatus;
};

export const swapperdConnected = (sdk: RenExSDK): boolean => {
    const status = currentSwapperdConnectionStatus(sdk);
    return (
        status === SwapperdConnectionStatus.ConnectedUnlocked
    );
};

export const resetSwapperdConnection = async (sdk: RenExSDK): Promise<SwapperdConnectionStatus> => {
    sdk._swapperdConnectionStatus = SwapperdConnectionStatus.NotConnected;
    return refreshSwapperdConnectionStatus(sdk);
};

export const refreshSwapperdConnectionStatus = async (sdk: RenExSDK): Promise<SwapperdConnectionStatus> => {
    sdk._swapperdConnectionStatus = await getSwapperdConnectionStatus(sdk);
    return sdk._swapperdConnectionStatus;
};

const getSwapperdConnectionStatus = async (sdk: RenExSDK): Promise<SwapperdConnectionStatus> => {
    const swapperStatus = await fetchSwapperStatus(sdk._networkData.network, sdk._networkData.ingress, () => getSwapperID(sdk));
    switch (swapperStatus) {
        case SwapperConnectionStatus.NotConnected:
            return SwapperdConnectionStatus.NotConnected;
        case SwapperConnectionStatus.ConnectedLocked:
            return SwapperdConnectionStatus.ConnectedLocked;
        case SwapperConnectionStatus.ConnectedUnlocked:
            return SwapperdConnectionStatus.ConnectedUnlocked;
        case SwapperConnectionStatus.NotAuthorized:
            return SwapperdConnectionStatus.SwapperdNotAuthorized;
        default:
            throw new Error(`Unknown swapper status: ${swapperStatus}`);
    }
};

export const authorizeSwapperd = async (sdk: RenExSDK): Promise<SwapperdConnectionStatus> => {
    const address = await getSwapperID(sdk);
    await _authorizeSwapperd(sdk.getWeb3(), sdk._networkData.ingress, address, sdk.getAddress());
    return refreshSwapperdConnectionStatus(sdk);
};

export const getSwapperID = async (sdk: RenExSDK): Promise<string> => {
    return fetchSwapperAddress(sdk._networkData.network);
};

export const getSwapperVersion = async (sdk: RenExSDK): Promise<string> => {
    return fetchSwapperVersion(sdk._networkData.network);
};

/* Swapperd balances */

export const supportedSwapperdTokens = async (sdk: RenExSDK): Promise<TokenCode[]> => [Token.BTC, Token.ETH, Token.WBTC, Token.DGX, Token.TUSD, Token.REN, Token.ZRX, Token.OMG];

const retrieveSwapperdBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<MaybeBigNumber[]> => {
    return getSwapperdBalances({ network: sdk._networkData.network }).then(balances => {
        return Promise.all(tokens.map(async token => {
            const tokenDetails = await getTokenDetails(sdk, token);
            if (balances[token]) {
                const balance = balances[token].balance;
                return fromSmallestUnit(balance, tokenDetails);
            }
            return null;
        }));
    });
};

export const swapperdAddresses = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<string[]> => {
    return getSwapperdAddresses(tokens, { network: sdk._networkData.network });
};

const usedSwapperdBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<BigNumber[]> => {
    return fetchTraderOrders(sdk).then(orders => {
        const usedFunds = new Map<TokenCode, BigNumber>();
        orders.forEach(order => {
            if (
                !order.swapServer &&
                order.computedOrderDetails.orderSettlement === OrderSettlement.RenExAtomic &&
                (
                    order.status === OrderStatus.NOT_SUBMITTED ||
                    order.status === OrderStatus.OPEN ||
                    order.status === OrderStatus.CONFIRMED
                )
            ) {
                const token = order.computedOrderDetails.spendToken;
                const usedTokenBalance = usedFunds.get(token);
                if (usedTokenBalance) {
                    usedFunds.set(token, usedTokenBalance.plus(order.computedOrderDetails.spendVolume));
                } else {
                    usedFunds.set(token, order.computedOrderDetails.spendVolume);
                }
            }
        });
        return tokens.map(token => usedFunds.get(token) || new BigNumber(0));
    });
};

export const swapperdBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<Map<TokenCode, SwapperdBalanceDetails>> => {
    return Promise.all([retrieveSwapperdBalances(sdk, tokens), usedSwapperdBalances(sdk, tokens)]).then(([
        startingBalance,
        usedBalance,
    ]) => {
        let swapperdBalance = new Map<TokenCode, SwapperdBalanceDetails>();
        tokens.forEach((token, index) => {
            let free: MaybeBigNumber = null;
            if (startingBalance[index] !== null) {
                free = BigNumber.max(new BigNumber(0), (startingBalance[index] as BigNumber).minus(usedBalance[index]));
            }
            swapperdBalance = swapperdBalance.set(token, {
                used: usedBalance[index],
                free,
            });
        });
        return swapperdBalance;
    });
};

// tslint:disable-next-line:no-any
export const submitOrder = async (sdk: RenExSDK, orderID: EncodedData, orderInputs: OrderInputsAll): Promise<any> => {
    const marketDetail = MarketPairs.get(orderInputs.symbol);
    if (!marketDetail) {
        throw new Error(`Unsupported market pair: ${orderInputs.symbol}`);
    }
    const baseToken = marketDetail.base;
    const quoteToken = marketDetail.quote;
    const quoteVolume = orderInputs.volume.times(orderInputs.price);

    const spendToken = orderInputs.side === OrderSide.BUY ? quoteToken : baseToken;
    const receiveToken = orderInputs.side === OrderSide.BUY ? baseToken : quoteToken;
    const receiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.volume : quoteVolume;
    const minimumReceiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.minVolume : orderInputs.price.times(orderInputs.minVolume);
    const spendVolume = orderInputs.side === OrderSide.BUY ? quoteVolume : orderInputs.volume;
    const spendTokenDetails = await getTokenDetails(sdk, spendToken);
    const receiveTokenDetails = await getTokenDetails(sdk, receiveToken);
    const tokenAddress = await swapperdAddresses(sdk, [spendToken, receiveToken]);
    // Convert the fee fraction to bips by multiplying by 10000
    const brokerFee = (await darknodeFees(sdk)).times(10000).toNumber();

    const req: SwapBlob = {
        sendToken: spendToken,
        receiveToken,
        sendAmount: toSmallestUnit(spendVolume, spendTokenDetails).toFixed(),
        receiveAmount: toSmallestUnit(receiveVolume, receiveTokenDetails).toFixed(),
        minimumReceiveAmount: toSmallestUnit(minimumReceiveVolume, receiveTokenDetails).toFixed(),
        brokerFee,
        delay: true,
        delayCallbackUrl: `${sdk._networkData.ingress}/swapperd/cb`,
        delayInfo: {
            orderID: orderID.toBase64(),
            kycAddr: sdk.getAddress(),
            sendTokenAddr: tokenAddress[0],
            receiveTokenAddr: tokenAddress[1],
        }
    };
    return submitSwap(req, sdk._networkData.network);
};

export async function fetchSwapperdOrderStatus(sdk: RenExSDK, orderID: EncodedData): Promise<OrderStatus> {
    const swap = await fetchSwapperdOrder(sdk, orderID);
    return toOrderStatus(swap.status);
}

export async function fetchSwapperdOrder(sdk: RenExSDK, orderID: EncodedData): Promise<SwapReceipt> {
    try {
        const swap = await findMatchingSwapReceipt((swapReceipt) => {
            if (swapReceipt.id === orderID.toBase64()) {
                return true;
            } else if (
                swapReceipt.delayInfo && swapReceipt.delayInfo.message &&
                swapReceipt.delayInfo.message.orderID === orderID.toBase64()
            ) {
                return true;
            }
            return false;
        }, sdk._networkData.network);
        return swap;
    } catch (error) {
        throw updateError(`${errors.CouldNotFindSwap}: ${orderID.toBase64()}`, error);
    }
}

export function toOrderStatus(status: SwapStatus): OrderStatus {
    switch (status) {
        case SwapStatus.INACTIVE:
        case SwapStatus.INITIATED:
        case SwapStatus.AUDITED:
        case SwapStatus.AUDIT_PENDING:
        case SwapStatus.AUDITED_SECRET:
            return OrderStatus.CONFIRMED;
        case SwapStatus.AUDIT_FAILED:
        case SwapStatus.REFUNDED:
        case SwapStatus.REFUND_FAILED:
            return OrderStatus.FAILED_TO_SETTLE;
        case SwapStatus.REDEEMED:
            return OrderStatus.SETTLED;
        case SwapStatus.CANCELLED:
        case SwapStatus.EXPIRED:
            return OrderStatus.CANCELED;
    }
}
