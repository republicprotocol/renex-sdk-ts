import BigNumber from "bignumber.js";

import RenExSDK, { TokenCode } from "../index";

import { EncodedData } from "../lib/encodedData";
import { MarketPairs } from "../lib/market";
import { fetchSwapperStatus, findMatchingSwapReceipt, getAtomicBalances, submitSwap, SwapBlob, SwapperConnectionStatus, SwapReceipt, SwapStatus } from "../lib/swapper";
import { fromSmallestUnit, toSmallestUnit } from "../lib/tokens";
import { AtomicBalanceDetails, AtomicConnectionStatus, OrderInputsAll, OrderSettlement, OrderSide, OrderStatus, Token } from "../types";
import { getTokenDetails } from "./balancesMethods";
import { darknodeFees } from "./settlementMethods";
import { fetchTraderOrders } from "./storageMethods";

/* Atomic Connection */

type MaybeBigNumber = BigNumber | null;

export const currentAtomConnectionStatus = (sdk: RenExSDK): AtomicConnectionStatus => {
    return sdk._atomConnectionStatus;
};

export const atomConnected = (sdk: RenExSDK): boolean => {
    const status = currentAtomConnectionStatus(sdk);
    return (
        status === AtomicConnectionStatus.ConnectedLocked ||
        status === AtomicConnectionStatus.ConnectedUnlocked
    );
};

export const resetAtomConnection = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    sdk._atomConnectedAddress = "";
    sdk._atomConnectionStatus = AtomicConnectionStatus.NotConnected;
    return refreshAtomConnectionStatus(sdk);
};

export const refreshAtomConnectionStatus = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    sdk._atomConnectionStatus = await getAtomConnectionStatus(sdk);
    return sdk._atomConnectionStatus;
};

const getAtomConnectionStatus = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    const swapperStatus = await fetchSwapperStatus(sdk._networkData.network);
    switch (swapperStatus) {
        case SwapperConnectionStatus.NotConnected:
            return AtomicConnectionStatus.NotConnected;
        case SwapperConnectionStatus.ConnectedLocked:
            return AtomicConnectionStatus.ConnectedLocked;
        case SwapperConnectionStatus.ConnectedUnlocked:
            return AtomicConnectionStatus.ConnectedUnlocked;
        default:
            throw new Error(`Unknown swapper status: ${swapperStatus}`);
    }
};

export const authorizeAtom = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    return refreshAtomConnectionStatus(sdk);
};

/* Atomic balances */

export const supportedAtomicTokens = async (sdk: RenExSDK): Promise<TokenCode[]> => [Token.BTC, Token.ETH];

const retrieveAtomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<MaybeBigNumber[]> => {
    return getAtomicBalances({ network: sdk._networkData.network }).then(balances => {
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

export const atomicAddresses = (sdk: RenExSDK, tokens: TokenCode[]): Promise<string[]> => {
    return getAtomicBalances({ network: sdk._networkData.network }).then(balances => {
        return Promise.all(tokens.map(async token => {
            if (balances[token]) {
                return balances[token].address;
            }
            return "";
        }));
    });
};

const usedAtomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<BigNumber[]> => {
    return fetchTraderOrders(sdk).then(orders => {
        const usedFunds = new Map<TokenCode, BigNumber>();
        orders.forEach(order => {
            if (order.computedOrderDetails.orderSettlement === OrderSettlement.RenExAtomic &&
                (order.status === OrderStatus.NOT_SUBMITTED ||
                    order.status === OrderStatus.OPEN ||
                    order.status === OrderStatus.CONFIRMED)
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

export const atomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<Map<TokenCode, AtomicBalanceDetails>> => {
    return Promise.all([retrieveAtomicBalances(sdk, tokens), usedAtomicBalances(sdk, tokens)]).then(([
        startingBalance,
        usedBalance,
    ]) => {
        let atomicBalance = new Map<TokenCode, AtomicBalanceDetails>();
        tokens.forEach((token, index) => {
            let free: MaybeBigNumber = null;
            if (startingBalance[index] !== null) {
                free = BigNumber.max(new BigNumber(0), (startingBalance[index] as BigNumber).minus(usedBalance[index]));
            }
            atomicBalance = atomicBalance.set(token, {
                used: usedBalance[index],
                free,
            });
        });
        return atomicBalance;
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
    const tokenAddress = await atomicAddresses(sdk, [spendToken, receiveToken]);
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
    console.log(JSON.stringify(req));
    return submitSwap(req, sdk._networkData.network);
};

export async function fetchAtomicOrderStatus(sdk: RenExSDK, orderID: EncodedData): Promise<OrderStatus> {
    const swap = await fetchAtomicOrder(sdk, orderID);
    return toOrderStatus(swap.status);
}

export async function fetchAtomicOrder(sdk: RenExSDK, orderID: EncodedData): Promise<SwapReceipt> {
    try {
        const swap = await findMatchingSwapReceipt((swapReceipt) => {
            try {
                return swapReceipt.delay !== undefined && swapReceipt.delayInfo.message.orderID === orderID.toBase64();
            } catch (error) {
                return false;
            }
        }, sdk._networkData.network);
        return swap;
    } catch (error) {
        throw new Error(`Couldn't find a swap with matching orderID: ${orderID.toBase64()}`);
    }
}

export function toOrderStatus(status: SwapStatus): OrderStatus {
    switch (status) {
        case SwapStatus.INACTIVE:
        case SwapStatus.INITIATED:
        case SwapStatus.AUDITED:
            return OrderStatus.CONFIRMED;
        case SwapStatus.AUDIT_FAILED:
        case SwapStatus.REFUNDED:
            return OrderStatus.FAILED_TO_SETTLE;
        case SwapStatus.REDEEMED:
            return OrderStatus.SETTLED;
        case SwapStatus.CANCELLED:
        case SwapStatus.EXPIRED:
            return OrderStatus.CANCELED;
    }
}
