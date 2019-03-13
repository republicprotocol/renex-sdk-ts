import { BigNumber } from "bignumber.js";

import * as ingress from "../lib/ingress";

import RenExSDK from "../index";

import { errors, updateError } from "../errors";
import { normalizePrice, normalizeVolume } from "../lib/conversion";
import { EncodedData, Encodings } from "../lib/encodedData";
import { MarketPairs } from "../lib/market";
import { submitSwap } from "../lib/swapper";
import { tokenToID, toSmallestUnit } from "../lib/tokens";
import { SentDelayedSwap, SentSwap } from "../lib/types/swapObject";
import {
    MarketDetails, NullConsole, OrderInputs, OrderInputsAll, OrderSide,
    OrderType, Token, TransactionOptions,
} from "../types";
import { swapperDAddresses } from "./swapperD";

// TODO: Decide where this should go (network env, or passed in to constructor)
export const REN_NODE_URL = "https://renex-testnet.herokuapp.com";

// TODO: Read these from the contract
const MIN_ETH_TRADE_VOLUME = 1;

export const darknodeFees = async (_sdk: RenExSDK): Promise<BigNumber> => {
    return new BigNumber(2).dividedBy(1000);
};

export const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const second = 1000;

const populateOrderDefaults = (
    orderInputs: OrderInputs,
    minEthTradeVolume: BigNumber,
    marketDetail: MarketDetails,
): OrderInputsAll => {
    const price = new BigNumber(orderInputs.price);
    const volume = new BigNumber(orderInputs.volume);
    const minVolume = calculateAbsoluteMinVolume(minEthTradeVolume, marketDetail.base, marketDetail.quote, price);
    return {
        symbol: orderInputs.symbol,
        side: orderInputs.side.toLowerCase() as OrderSide,
        price,
        volume,
        priorityVolume: orderInputs.priorityVolume ? new BigNumber(orderInputs.priorityVolume) : volume.times(price),

        minVolume: orderInputs.minVolume ? new BigNumber(orderInputs.minVolume) : minVolume,
        expiry: 0,
        type: orderInputs.type !== undefined ? orderInputs.type : OrderType.LIMIT,
    };
};

export const getMinEthTradeVolume = async (sdk: RenExSDK): Promise<BigNumber> => {
    return Promise.resolve(new BigNumber(MIN_ETH_TRADE_VOLUME));
};

const calculateAbsoluteMinVolume = (minEthTradeVolume: BigNumber, baseToken: Token, quoteToken: Token, price: BigNumber) => {
    if (quoteToken === Token.BTC) {
        if (baseToken === Token.ETH) {
            return minEthTradeVolume;
        }
        return normalizeVolume(minEthTradeVolume.dividedBy(price).multipliedBy(0.01), true);
    }
    return normalizeVolume(minEthTradeVolume.dividedBy(price), true);
};

const normalizeOrder = (order: OrderInputsAll): OrderInputsAll => {
    const newOrder: OrderInputsAll = Object.assign(order, {});
    newOrder.price = normalizePrice(order.price, order.side === OrderSide.SELL);
    newOrder.volume = normalizeVolume(order.volume);
    newOrder.minVolume = normalizeVolume(order.minVolume);
    return newOrder;
};

const isNormalized = (order: OrderInputsAll): boolean => {
    const priceEq = order.price.eq(normalizePrice(order.price, order.side === OrderSide.SELL));
    const volumeEq = order.volume.eq(normalizeVolume(order.volume));
    const minVolumeEq = order.minVolume.eq(normalizeVolume(order.minVolume));
    return priceEq && volumeEq && minVolumeEq;
};

const isValidDecimals = (order: OrderInputsAll, decimals: number): boolean => {
    const volumeEq = order.volume.eq(new BigNumber(order.volume.toFixed(decimals)));
    const minVolumeEq = order.minVolume.eq(new BigNumber(order.minVolume.toFixed(decimals)));
    return volumeEq && minVolumeEq;
};

export const validateSwap = async (
    sdk: RenExSDK,
    orderInputsIn: OrderInputs,
    options?: TransactionOptions,
): Promise<[ingress.NewOrder, SentDelayedSwap]> => {
    const marketDetail = MarketPairs.get(orderInputsIn.symbol);
    if (!marketDetail) {
        throw new Error(`Unsupported market pair: ${orderInputsIn.symbol}`);
    }

    const minEthTradeVolume = await getMinEthTradeVolume(sdk);
    // const unixSeconds = Math.floor(new Date().getTime() / 1000);
    let orderInputs = populateOrderDefaults(orderInputsIn, minEthTradeVolume, marketDetail);

    const baseToken = marketDetail.base;
    const quoteToken = marketDetail.quote;
    const baseTokenDetails = sdk.tokenDetails.get(baseToken);

    if (!baseTokenDetails) {
        throw new Error(`Unknown token ${baseToken}`);
    }

    if (!isValidDecimals(orderInputs, baseTokenDetails.decimals)) {
        throw new Error(`Order volumes are invalid. ${baseToken} is limited to ${baseTokenDetails.decimals} decimal places.`);
    }

    if (!isNormalized(orderInputs)) {
        if (sdk.getConfig().autoNormalizeOrders) {
            orderInputs = normalizeOrder(orderInputs);
        } else {
            throw new Error("Order inputs have not been normalized.");
        }
    }

    // const quoteVolume = orderInputs.priorityVolume;

    const sendToken = orderInputs.side === OrderSide.BUY ? quoteToken : baseToken;
    const receiveToken = orderInputs.side === OrderSide.BUY ? baseToken : quoteToken;
    // const receiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.volume : quoteVolume;
    // const spendVolume = orderInputs.side === OrderSide.BUY ? quoteVolume : orderInputs.volume;

    // const feePercent = await darknodeFees(sdk);
    // const feeToken = receiveToken;
    // const feeAmount = quoteVolume.times(feePercent);

    const simpleConsole = (options && options.simpleConsole) || NullConsole;

    if (orderInputs.price.lte(new BigNumber(0))) {
        simpleConsole.error(errors.InvalidPrice);
        throw new Error(errors.InvalidPrice);
    }
    if (orderInputs.volume.lte(new BigNumber(0))) {
        simpleConsole.error(errors.InvalidVolume);
        throw new Error(errors.InvalidVolume);
    }
    if (orderInputs.minVolume.lt(new BigNumber(0))) {
        simpleConsole.error(errors.InvalidMinimumVolume);
        throw new Error(errors.InvalidMinimumVolume);
    }

    const absoluteMinVolume = calculateAbsoluteMinVolume(minEthTradeVolume, baseToken, quoteToken, orderInputs.price);
    if (orderInputs.volume.lt(absoluteMinVolume)) {
        let errMsg = `Volume must be at least ${absoluteMinVolume} ${baseToken}`;
        if (baseToken !== Token.ETH) {
            errMsg += ` or ${minEthTradeVolume} ${Token.ETH}`;
        }
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }
    if (orderInputs.minVolume.lt(absoluteMinVolume)) {
        let errMsg = `Minimum volume must be at least ${absoluteMinVolume} ${baseToken}`;
        if (baseToken !== Token.ETH) {
            errMsg += ` or ${minEthTradeVolume} ${Token.ETH}`;
        }
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }
    if (orderInputs.volume.lt(orderInputs.minVolume)) {
        const errMsg = `Volume must be greater or equal to minimum volume: (${orderInputs.minVolume})`;
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }

    const newOrder: ingress.NewOrder = {
        id: ingress.randomNonce().toString("hex"),
        sendToken: tokenToID(sendToken),
        receiveToken: tokenToID(receiveToken),
        marketID: `${baseToken}-${quoteToken}`,
        price: orderInputs.price.toNumber(), // 350,
        volume: orderInputs.volume.toNumber() * 100, // 100,
        min_Volume: orderInputs.minVolume.toNumber() * 100, // 10,
    };

    const orderID = new EncodedData(newOrder.id, Encodings.HEX);

    const _receiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.volume : orderInputs.priorityVolume;
    const _minimumReceiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.minVolume : orderInputs.price.times(orderInputs.minVolume);
    const _spendVolume = orderInputs.side === OrderSide.BUY ? orderInputs.priorityVolume : orderInputs.volume;
    const _sendTokenDetails = sdk.tokenDetails.get(sendToken);
    if (!_sendTokenDetails) {
        throw new Error(`Unknown token ${sendToken}`);
    }
    const _receiveTokenDetails = sdk.tokenDetails.get(receiveToken);
    if (!_receiveTokenDetails) {
        throw new Error(`Unknown token ${receiveToken}`);
    }
    const _tokenAddress = await swapperDAddresses(sdk, [sendToken, receiveToken]);
    // Convert the fee fraction to bips by multiplying by 10000
    const _brokerFee = (await darknodeFees(sdk)).times(10000).toNumber();

    const sentSwap: SentSwap = {
        sendToken,
        receiveToken,
        sendAmount: toSmallestUnit(_spendVolume, _sendTokenDetails.decimals).decimalPlaces(0, BigNumber.ROUND_UP).toFixed(),
        receiveAmount: toSmallestUnit(_receiveVolume, _receiveTokenDetails.decimals).decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed(),
        minimumReceiveAmount: toSmallestUnit(_minimumReceiveVolume, _receiveTokenDetails.decimals).decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed(),
        brokerFee: _brokerFee,
        delay: true,
        // delayCallbackUrl: `${sdk._networkData.ingress}/swapperD/cb`,
        delayCallbackUrl: `${REN_NODE_URL}/swaps`,
        delayInfo: {
            orderID: orderID.toBase64(),
            kycAddr: sdk.getAddress(),
            sendTokenAddr: _tokenAddress[0],
            receiveTokenAddr: _tokenAddress[1],
        }
    };

    return [newOrder, sentSwap];
};

export const openOrder = async (
    sdk: RenExSDK,
    orderInputsIn: OrderInputs | undefined,
    options?: TransactionOptions,
    sentSwapIn?: [ingress.NewOrder, SentDelayedSwap],
): Promise<SentDelayedSwap> => {

    let sentSwap: SentDelayedSwap;
    let newOrder: ingress.NewOrder;
    if (orderInputsIn !== undefined) {
        [newOrder, sentSwap] = await validateSwap(sdk, orderInputsIn, options);
    } else if (sentSwapIn !== undefined) {
        [newOrder, sentSwap] = sentSwapIn;
    } else {
        throw new Error(`No order inputs provided`);
    }

    const simpleConsole = (options && options.simpleConsole) || NullConsole;

    simpleConsole.log("Submitting order to SwapperD");
    try {
        await submitSwap(sentSwap, sdk._networkData.network);
    } catch (error) {
        simpleConsole.error(error.message || error);
        throw updateError(`Error sending order to SwapperD: ${error.message || error}`, error);
    }

    // Create order fragment mapping
    simpleConsole.log("Building order mapping");

    let orderFragmentMappings;
    try {
        orderFragmentMappings = await ingress.buildOrderMapping(sdk.getWeb3(), sdk._contracts.darknodeRegistry, newOrder, simpleConsole);
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    const request = new ingress.EncryptedShares({
        orderID: sentSwap.delayInfo.orderID,
        sendToken: newOrder.sendToken,
        receiveToken: newOrder.receiveToken,
        pods: orderFragmentMappings,
    });

    simpleConsole.log("Sending order fragments");
    // let signature;
    try {
        await ingress.submitOrderFragments(sdk._networkData.ingress, request);
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    // const podMap = Map<string, PodShares>();

    // let encryptedShares = new EncryptedShares({
    //     orderID: order.id,
    //     sendToken: order.sendToken,
    //     receiveToken: order.receiveToken,
    //     pods: podMap,
    // });

    simpleConsole.log("Order submitted.");

    // let timeout = 10;
    // let swapObject: UnfixedReturnedSwap | undefined;

    // console.log(`Looking for ${sentSwap.delayInfo.orderID}`);
    // while (!swapObject && timeout > 0) {
    //     console.log("Nothing yet...");
    //     const orders = await getSwapperDSwaps({ network: sdk._networkData.network });
    //     for (const swaps of orders.swaps) {
    //         console.log(swaps);
    //     }
    //     swapObject = orders.swaps.find((swap) => swap.delay === true && swap.delayInfo.message.orderID === sentSwap.delayInfo.orderID);
    //     timeout--;
    //     await sleep(1 * second);
    // }

    // const traderOrder: TraderOrder = {
    //     swapServer: undefined,
    //     orderInputs,
    //     status: OrderStatus.NOT_SUBMITTED,
    //     trader: sdk.getAddress(),
    //     id: orderID.toBase64(),
    //     computedOrderDetails: {
    //         spendToken: sendToken,
    //         receiveToken,
    //         spendVolume,
    //         receiveVolume,
    //         date: unixSeconds,
    //         feeAmount,
    //         feeToken,
    //         nonce,
    //     },
    // };

    return sentSwap;
};
