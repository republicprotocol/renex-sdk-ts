import BigNumber from "bignumber.js";

import RenExSDK, { TokenCode } from "../index";

import { errors, updateError } from "../errors";
import { EncodedData } from "../lib/encodedData";
import { MarketPairs } from "../lib/market";
import { fetchSwapperAddress, fetchSwapperStatus, fetchSwapperVersion, findMatchingSwapReceipt, getSwapperDAddresses, getSwapperDBalances, submitSwap, SwapBlob, SwapperConnectionStatus, SwapReceipt, SwapStatus } from "../lib/swapper";
import { fromSmallestUnit, toSmallestUnit } from "../lib/tokens";
import { OrderInputsAll, OrderSettlement, OrderSide, OrderStatus, SwapperDBalanceDetails, SwapperDConnectionStatus, Token } from "../types";
import { getTokenDetails } from "./balancesMethods";
import { darknodeFees } from "./settlementMethods";
import { fetchTraderOrders } from "./storageMethods";

/* SwapperD Connection */

type MaybeBigNumber = BigNumber | null;

export const currentSwapperDConnectionStatus = (sdk: RenExSDK): SwapperDConnectionStatus => {
    return sdk._swapperDConnectionStatus;
};

export const swapperDConnected = (sdk: RenExSDK): boolean => {
    const status = currentSwapperDConnectionStatus(sdk);
    return (
        status === SwapperDConnectionStatus.ConnectedUnlocked
    );
};

export const resetSwapperDConnection = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
    sdk._swapperDConnectionStatus = SwapperDConnectionStatus.NotConnected;
    return refreshSwapperDConnectionStatus(sdk);
};

export const refreshSwapperDConnectionStatus = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
    sdk._swapperDConnectionStatus = await getSwapperDConnectionStatus(sdk);
    return sdk._swapperDConnectionStatus;
};

const getSwapperDConnectionStatus = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
    const swapperStatus = await fetchSwapperStatus(sdk._networkData.network, sdk._networkData.ingress, () => getSwapperID(sdk));
    switch (swapperStatus) {
        case SwapperConnectionStatus.NotConnected:
            return SwapperDConnectionStatus.NotConnected;
        case SwapperConnectionStatus.ConnectedLocked:
            return SwapperDConnectionStatus.ConnectedLocked;
        case SwapperConnectionStatus.ConnectedUnlocked:
            return SwapperDConnectionStatus.ConnectedUnlocked;
        // case SwapperConnectionStatus.NotAuthorized:
        //     return SwapperDConnectionStatus.SwapperDNotAuthorized;
        default:
            throw new Error(`Unknown swapper status: ${swapperStatus}`);
    }
};

// export const authorizeSwapperD = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
//     const address = await getSwapperID(sdk);
//     await _authorizeSwapperD(sdk.getWeb3(), sdk._networkData.ingress, address, sdk.getAddress());
//     return refreshSwapperDConnectionStatus(sdk);
// };

export const getSwapperID = async (sdk: RenExSDK): Promise<string> => {
    return fetchSwapperAddress(sdk._networkData.network);
};

export const getSwapperVersion = async (sdk: RenExSDK): Promise<string> => {
    return fetchSwapperVersion(sdk._networkData.network);
};

/* SwapperD balances */

export const supportedSwapperDTokens = async (sdk: RenExSDK): Promise<TokenCode[]> => [Token.BTC, Token.ETH, Token.TUSD];

const retrieveSwapperDBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<MaybeBigNumber[]> => {
    return getSwapperDBalances({ network: sdk._networkData.network }).then(balances => {
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

export const swapperDAddresses = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<string[]> => {
    return getSwapperDAddresses(tokens, { network: sdk._networkData.network });
};

const usedSwapperDBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<BigNumber[]> => {
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
        return tokens.map(token => {
            const funds = usedFunds.get(token);
            // For some reason orders can become corrupted so we also want to make sure
            // that their values are proper values.
            if (funds && funds.isFinite()) {
                return funds;
            }
            return new BigNumber(0);
        });
    });
};

export const swapperDBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<Map<TokenCode, SwapperDBalanceDetails>> => {
    return Promise.all([retrieveSwapperDBalances(sdk, tokens), usedSwapperDBalances(sdk, tokens)]).then(([
        startingBalance,
        usedBalance,
    ]) => {
        let swapperDBalance = new Map<TokenCode, SwapperDBalanceDetails>();
        tokens.forEach((token, index) => {
            let free: MaybeBigNumber = null;
            if (startingBalance[index] !== null) {
                free = BigNumber.max(new BigNumber(0), (startingBalance[index] as BigNumber).minus(usedBalance[index]));
            }
            swapperDBalance = swapperDBalance.set(token, {
                used: usedBalance[index],
                free,
            });
        });
        return swapperDBalance;
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
    const tokenAddress = await swapperDAddresses(sdk, [spendToken, receiveToken]);
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
        delayCallbackUrl: `${sdk._networkData.ingress}/swapperD/cb`,
        delayInfo: {
            orderID: orderID.toBase64(),
            kycAddr: sdk.getAddress(),
            sendTokenAddr: tokenAddress[0],
            receiveTokenAddr: tokenAddress[1],
        }
    };
    return submitSwap(req, sdk._networkData.network);
};

export async function fetchSwapperDOrderStatus(sdk: RenExSDK, orderID: EncodedData): Promise<OrderStatus> {
    const swap = await fetchSwapperDOrder(sdk, orderID);
    return toOrderStatus(swap.status);
}

export async function fetchSwapperDOrder(sdk: RenExSDK, orderID: EncodedData): Promise<SwapReceipt> {
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
