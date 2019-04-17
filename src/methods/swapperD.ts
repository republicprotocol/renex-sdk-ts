import BigNumber from "bignumber.js";

import RenExSDK from "../index";

import { errors, updateError } from "../errors";
import { EncodedData } from "../lib/encodedData";
import {
    fetchSwapperAddress, fetchSwapperStatus, fetchSwapperVersion,
    findMatchingReturnedSwap, fixSwapType, getSwapperDAddresses,
    getSwapperDBalances, getSwapperDSwaps, SwapperConnectionStatus,
} from "../lib/swapper";
import { fromSmallestUnit, Token } from "../lib/tokens";
import { ReturnedSwap, SwapStatus } from "../lib/types/swapObject";
import { OrderStatus, SwapperDBalanceDetails, SwapperDConnectionStatus } from "../types";

/***********************
 * SwapperD Connection *
 ***********************/

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

export const getSwapperID = async (sdk: RenExSDK): Promise<string> => {
    return fetchSwapperAddress(sdk._networkData.network);
};

export const getSwapperVersion = async (sdk: RenExSDK): Promise<string> => {
    return fetchSwapperVersion(sdk._networkData.network);
};

const getSwapperDConnectionStatus = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
    const swapperStatus = await fetchSwapperStatus(sdk._networkData.network, sdk._networkData.renexNode, () => getSwapperID(sdk));
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

export const refreshSwapperDConnectionStatus = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
    sdk._swapperDConnectionStatus = await getSwapperDConnectionStatus(sdk);
    return sdk._swapperDConnectionStatus;
};

export const resetSwapperDConnection = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
    sdk._swapperDConnectionStatus = SwapperDConnectionStatus.NotConnected;
    return refreshSwapperDConnectionStatus(sdk);
};

// export const authorizeSwapperD = async (sdk: RenExSDK): Promise<SwapperDConnectionStatus> => {
//     const address = await getSwapperID(sdk);
//     await _authorizeSwapperD(sdk.getWeb3(), sdk._networkData.renexNode, address, sdk.getAddress());
//     return refreshSwapperDConnectionStatus(sdk);
// };

/*********************
 * SwapperD balances *
 *********************/

const retrieveSwapperDBalances = async (sdk: RenExSDK, tokens: Token[]): Promise<MaybeBigNumber[]> => {
    return getSwapperDBalances({ network: sdk._networkData.network }).then(async (balances) => {
        return Promise.all(tokens.map(async token => {
            const tokenDetails = sdk.tokenDetails.get(token);
            if (tokenDetails && balances[token]) {
                const balance = balances[token].balance;
                return fromSmallestUnit(balance, tokenDetails.decimals);
            }
            return null;
        }));
    });
};

export const swapperDAddresses = async (sdk: RenExSDK, tokens: Token[]): Promise<string[]> => {
    return getSwapperDAddresses(tokens, { network: sdk._networkData.network });
};

// const usedSwapperDBalances = async (sdk: RenExSDK, tokens: Token[]): Promise<BigNumber[]> => {
//     return fetchTraderOrders(sdk, { refresh: false }).then(orders => {
//         const usedFunds = new Map<Token, BigNumber>();
//         orders.forEach(order => {
//             if (
//                 !order.swapServer &&
//                 (
//                     order.status === OrderStatus.NOT_SUBMITTED ||
//                     order.status === OrderStatus.OPEN ||
//                     order.status === OrderStatus.CONFIRMED
//                 )
//             ) {
//                 const token = order.computedOrderDetails.spendToken;
//                 const usedTokenBalance = usedFunds.get(token);
//                 if (usedTokenBalance) {
//                     usedFunds.set(token, usedTokenBalance.plus(order.computedOrderDetails.spendVolume));
//                 } else {
//                     usedFunds.set(token, order.computedOrderDetails.spendVolume);
//                 }
//             }
//         });
//         return tokens.map(token => {
//             const funds = usedFunds.get(token);
//             // For some reason orders can become corrupted so we also want to make sure
//             // that their values are proper values.
//             if (funds && funds.isFinite()) {
//                 return funds;
//             }
//             return new BigNumber(0);
//         });
//     });
// };

export const swapperDBalances = async (sdk: RenExSDK, tokens: Token[]): Promise<Map<Token, SwapperDBalanceDetails>> => {
    return Promise.all([retrieveSwapperDBalances(sdk, tokens)]).then(([
        startingBalance,
        // usedBalance,
    ]) => {
        let swapperDBalance = new Map<Token, SwapperDBalanceDetails>();
        tokens.forEach((token, index) => {
            // let free: MaybeBigNumber = null;
            // if (startingBalance[index] !== null) {
            //     free = BigNumber.max(new BigNumber(0), (startingBalance[index] as BigNumber).minus(usedBalance[index]));
            // }
            swapperDBalance = swapperDBalance.set(token, {
                used: new BigNumber(0), // usedBalance[index],
                free: startingBalance[index],
            });
        });
        return swapperDBalance;
    });
};

/******************
 * SwapperD swaps *
 ******************/

export const swapperDSwaps = async (sdk: RenExSDK): Promise<ReturnedSwap[]> => {
    return getSwapperDSwaps({ network: sdk._networkData.network }).then(swaps => {
        return swaps.swaps.map(fixSwapType);
    });
};

export const fetchSwapperDOrder = async (sdk: RenExSDK, orderID: EncodedData): Promise<ReturnedSwap> => {
    try {
        return await findMatchingReturnedSwap((swapReceipt) => {
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
    } catch (error) {
        throw updateError(`${errors.CouldNotFindSwap}: ${orderID.toBase64()}`, error);
    }
};

export const toOrderStatus = (status: SwapStatus): OrderStatus => {
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
};

export const fetchSwapperDOrderStatus = async (sdk: RenExSDK, orderID: EncodedData): Promise<OrderStatus> => {
    const swap = await fetchSwapperDOrder(sdk, orderID);
    return toOrderStatus(swap.status);
};
