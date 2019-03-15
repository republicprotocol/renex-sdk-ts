import BN from "bn.js";

import { BigNumber } from "bignumber.js";

import * as ingress from "../lib/ingress";

import RenExSDK from "../index";

import { errors, updateError } from "../errors";
import { normalizePrice, normalizeVolume } from "../lib/conversion";
import { EncodedData, Encodings } from "../lib/encodedData";
import { getMarket } from "../lib/market";
import { submitSwap } from "../lib/swapper";
import { MarketPairs, Token, Tokens, toSmallestUnit } from "../lib/tokens";
import { SentDelayedSwap, SentSwap } from "../lib/types/swapObject";
import {
    NullConsole, OrderInputs, OrderInputsAll, OrderSide, TransactionOptions,
} from "../types";
import { swapperDAddresses } from "./swapperD";

// TODO: Decide where this should go (network env, or passed in to constructor)
export const REN_NODE_URL = "https://renex-testnet.herokuapp.com";

export const darknodeFees = async (_sdk: RenExSDK): Promise<BigNumber> => {
    return new BigNumber(2).dividedBy(1000);
};

export const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export const second = 1000;

export const populateOrderDefaults = (
    orderInputs: OrderInputs,
): OrderInputsAll => {

    const definedDetails =
        (orderInputs.sendVolume === undefined ? 0 : 1) +
        (orderInputs.receiveVolume === undefined ? 0 : 1) +
        (orderInputs.price === undefined ? 0 : 1);
    if (definedDetails < 2) {
        throw new Error("Must provide two of send-volume, receive-volume and price.");
    }

    const marketPair = getMarket(orderInputs.receiveToken, orderInputs.sendToken);
    if (!marketPair) {
        throw new Error(`Unsupported market pair: ${orderInputs.receiveToken}/${orderInputs.sendToken}`);
    }

    const marketDetails = MarketPairs.get(marketPair);
    if (!marketDetails) {
        throw new Error(`Unsupported market pair: ${marketPair}`);
    }

    const side = orderInputs.receiveToken === marketDetails.base ? OrderSide.BUY : OrderSide.SELL;

    let sendVolume = orderInputs.sendVolume ? normalizeVolume(new BigNumber(orderInputs.sendVolume), false) : undefined;
    let receiveVolume = orderInputs.receiveVolume ? normalizeVolume(new BigNumber(orderInputs.receiveVolume), true) : undefined;
    let price = orderInputs.price ? normalizePrice(new BigNumber(orderInputs.price), side === OrderSide.SELL) : undefined;

    if (!sendVolume) {
        // tslint:disable-next-line: no-non-null-assertion no-unnecessary-type-assertion
        sendVolume = normalizeVolume(receiveVolume!.div(price!), false);
    }

    if (!receiveVolume) {
        // tslint:disable-next-line: no-non-null-assertion no-unnecessary-type-assertion
        receiveVolume = normalizeVolume(sendVolume.times(price!), true);
    }

    if (!price) {
        price = receiveVolume.div(sendVolume);
    }

    const baseToken = marketDetails.base;
    const baseVolume = orderInputs.sendToken === baseToken ? sendVolume : receiveVolume;
    const quoteToken = marketDetails.quote;
    const quoteVolume = orderInputs.sendToken === quoteToken ? sendVolume : receiveVolume;

    const minQuoteVolume = orderInputs.allOrNothing ? quoteVolume :
        orderInputs.minQuoteVolume ? new BigNumber(orderInputs.minQuoteVolume) : enforcedMinQuoteVolume(marketDetails.quote);
    const minBaseVolume = minQuoteVolume.div(price);
    const minReceiveVolume = orderInputs.receiveToken === quoteToken ? minQuoteVolume : minBaseVolume;
    const minSendVolume = orderInputs.sendToken === quoteToken ? minQuoteVolume : minBaseVolume;

    return {
        ...orderInputs,

        side,
        marketPair,
        marketDetails,

        price,
        sendVolume,
        receiveVolume,
        minQuoteVolume,
        minBaseVolume,
        minSendVolume,

        baseToken,
        baseVolume,
        quoteToken,
        quoteVolume,
        minReceiveVolume,
    };
};

export const enforcedMinQuoteVolume = (quoteToken: Token) => {
    if (quoteToken === Token.BTC) {
        return new BigNumber(0.003);
    } else if (quoteToken === Token.ETH) {
        return new BigNumber(0.1);
    } else if (quoteToken === Token.DAI) {
        return new BigNumber(10);
    } else {
        return new BigNumber(0);
    }
};

export const validateUserInputs = (
    orderInputsIn: OrderInputs,
    sendTokenBalance: BigNumber | null | undefined,
    options?: TransactionOptions,
    all = false,
): OrderInputsAll => {

    const inputs = populateOrderDefaults(orderInputsIn);

    const simpleConsole = (options && options.simpleConsole) || NullConsole;

    if (inputs.price.lt(new BigNumber(0))) {
        simpleConsole.error(errors.InvalidPrice);
        throw new Error(errors.InvalidPrice);
    }
    if (inputs.sendVolume.lt(new BigNumber(0))) {
        simpleConsole.error(errors.InvalidVolume);
        throw new Error(errors.InvalidVolume);
    }
    if (inputs.receiveVolume.lt(new BigNumber(0))) {
        simpleConsole.error(errors.InvalidMinimumVolume);
        throw new Error(errors.InvalidMinimumVolume);
    }

    if (sendTokenBalance) {
        if (inputs.sendVolume.gt(sendTokenBalance)) {
            const errorMessage = "Insufficient balance";
            simpleConsole.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    return inputs;
};

export const validateSwap = async (
    sdk: RenExSDK,
    orderInputsIn: OrderInputs,
    options?: TransactionOptions,
): Promise<SentDelayedSwap> => {

    const balances = await sdk.swapperD.fetchBalances([orderInputsIn.sendToken, orderInputsIn.receiveToken]);
    const sendBalance = balances.get(orderInputsIn.sendToken);

    const inputs = validateUserInputs(orderInputsIn, sendBalance && sendBalance.free, options);

    const simpleConsole = (options && options.simpleConsole) || NullConsole;

    // Check that the quote volume is greater than the minimum quote volume
    if (inputs.sendVolume.lt(inputs.minSendVolume)) {
        const errMsg = `Volume must be at least ${inputs.minSendVolume} ${inputs.sendToken}`;
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }

    // Check that the minimum quote volume is greater than the enforced minimum
    // (this implies that the quote volume is also greater by previous check)
    const enforcedQuoteVolume = enforcedMinQuoteVolume(inputs.quoteToken);
    const enforcedSendVolume = inputs.sendToken === inputs.quoteToken ? enforcedQuoteVolume : enforcedQuoteVolume.div(inputs.price);

    if (inputs.sendVolume.lt(enforcedSendVolume)) {
        const errMsg = `Volume must be at least ${enforcedSendVolume} ${inputs.sendToken}`;
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }

    const _tokenAddress = await swapperDAddresses(sdk, [inputs.sendToken, inputs.receiveToken]);
    // Convert the fee fraction to bips by multiplying by 10000
    const _brokerFee = (await darknodeFees(sdk)).times(10000).toNumber();

    const sendTokenDetails = sdk.tokenDetails.get(inputs.sendToken);
    if (!sendTokenDetails) {
        throw new Error(`Unknown token ${inputs.sendToken}`);
    }
    const receiveTokenDetails = sdk.tokenDetails.get(inputs.receiveToken);
    if (!receiveTokenDetails) {
        throw new Error(`Unknown token ${inputs.receiveToken}`);
    }

    const sentSwap: SentSwap = {
        sendToken: inputs.sendToken,
        receiveToken: inputs.receiveToken,
        sendAmount: toSmallestUnit(inputs.sendVolume, sendTokenDetails.decimals).decimalPlaces(0, BigNumber.ROUND_UP).toFixed(),
        receiveAmount: toSmallestUnit(inputs.receiveVolume, receiveTokenDetails.decimals).decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed(),
        minimumReceiveAmount: toSmallestUnit(inputs.minReceiveVolume, receiveTokenDetails.decimals).decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed(),
        brokerFee: _brokerFee,
        delay: true,
        delayCallbackUrl: `${REN_NODE_URL}/swaps`,
        delayInfo: {
            orderID: new EncodedData(ingress.randomNonce().toString("hex"), Encodings.HEX).toBase64(),
            kycAddr: sdk.getAddress(),
            sendTokenAddr: _tokenAddress[0],
            receiveTokenAddr: _tokenAddress[1],
        }
    };

    return sentSwap;
};

export const openOrder = async (
    sdk: RenExSDK,
    orderInputsIn: OrderInputs | undefined,
    options?: TransactionOptions,
    sentSwapIn?: SentDelayedSwap,
): Promise<SentDelayedSwap> => {

    let sentSwap: SentDelayedSwap;
    if (orderInputsIn !== undefined) {
        sentSwap = await validateSwap(sdk, orderInputsIn, options);
    } else if (sentSwapIn !== undefined) {
        sentSwap = sentSwapIn;
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

    const marketPair = getMarket(sentSwap.receiveToken, sentSwap.sendToken);
    if (!marketPair) {
        throw new Error(`Unsupported market pair: ${sentSwap.receiveToken}/${sentSwap.sendToken}`);
    }

    const marketDetails = MarketPairs.get(marketPair);
    if (!marketDetails) {
        throw new Error(`Unsupported market pair: ${marketPair}`);
    }

    const side = sentSwap.receiveToken === marketDetails.base ? OrderSide.BUY : OrderSide.SELL;

    const volume = new BN(side === OrderSide.BUY ? sentSwap.receiveAmount : sentSwap.sendAmount);
    const receiveVolume = new BN(sentSwap.receiveAmount);
    const sendVolume = new BN(sentSwap.sendAmount);
    const minReceiveVolume = new BN(sentSwap.minimumReceiveAmount || "0");

    // TODO: Correct this.
    const price = side === OrderSide.BUY ? receiveVolume.div(sendVolume) : sendVolume.div(receiveVolume);
    // tslint:disable-next-line: variable-name
    const min_Volume = side === OrderSide.BUY ? minReceiveVolume : minReceiveVolume.div(price);

    const sendTokenDetails = Tokens.get(sentSwap.sendToken);
    if (!sendTokenDetails) {
        throw new Error(`Unsupported token: ${sentSwap.sendToken}`);
    }

    const receiveTokenDetails = Tokens.get(sentSwap.receiveToken);
    if (!receiveTokenDetails) {
        throw new Error(`Unsupported token: ${sentSwap.receiveToken}`);
    }

    const newOrder: ingress.NewOrder = {
        id: new EncodedData(sentSwap.delayInfo.orderID).toHex(),
        sendToken: sendTokenDetails.priority,
        receiveToken: receiveTokenDetails.priority,
        marketID: `${marketDetails.base}-${marketDetails.quote}`,
        volume,
        price, // 350,
        min_Volume, // 10,
    };

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
