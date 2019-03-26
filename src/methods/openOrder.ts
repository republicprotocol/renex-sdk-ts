import BN from "bn.js";

import { BigNumber } from "bignumber.js";

import * as renexNode from "../lib/renexNode";

import RenExSDK from "../index";

import { errors, updateError } from "../errors";
import { normalizePrice, normalizeVolume, shiftDecimals } from "../lib/conversion";
import { getMarket } from "../lib/market";
import { submitSwap } from "../lib/swapper";
import { MarketPairs, Token, Tokens, toSmallestUnit } from "../lib/tokens";
import { SentDelayedSwap, SentSwap } from "../lib/types/swapObject";
import {
    NullConsole, OrderInputs, OrderInputsAll, OrderSide, TransactionOptions,
} from "../types";
import { swapperDAddresses } from "./swapperD";

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

    const mininimumQuoteFill = orderInputs.allOrNothing ? quoteVolume :
        orderInputs.mininimumQuoteFill ? new BigNumber(orderInputs.mininimumQuoteFill) : minimumQuoteVolume(marketDetails.quote);
    const mininimumBaseFill = mininimumQuoteFill.div(price);
    const mininimumReceiveFill = orderInputs.receiveToken === quoteToken ? mininimumQuoteFill : mininimumBaseFill;
    const mininimumSendFill = orderInputs.sendToken === quoteToken ? mininimumQuoteFill : mininimumBaseFill;

    return {
        ...orderInputs,

        side,
        marketPair,
        marketDetails,

        price,
        sendVolume,
        receiveVolume,
        mininimumQuoteFill,
        mininimumBaseFill,
        mininimumSendFill,

        baseToken,
        baseVolume,
        quoteToken,
        quoteVolume,
        mininimumReceiveFill,
    };
};

export const minimumQuoteVolume = (quoteToken: Token) => {
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
        simpleConsole.error(errors.InvalidMinimumFill);
        throw new Error(errors.InvalidMinimumFill);
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
    if (inputs.sendVolume.lt(inputs.mininimumSendFill)) {
        const errMsg = `Volume must be at least ${inputs.mininimumSendFill} ${inputs.sendToken}`;
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }

    // Check that the minimum quote volume is greater than the enforced minimum
    // (this implies that the quote volume is also greater by previous check)
    const enforcedQuoteVolume = minimumQuoteVolume(inputs.quoteToken);
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
        minimumReceiveAmount: toSmallestUnit(inputs.mininimumReceiveFill, receiveTokenDetails.decimals).decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed(),
        brokerFee: _brokerFee,
        delay: true,
        delayCallbackUrl: `${sdk._networkData.renexNode}/swaps`,
        delayInfo: {
            orderID: renexNode.randomNonce().toString("hex"),
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
    options: TransactionOptions,
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

    const marketPair = getMarket(sentSwap.receiveToken, sentSwap.sendToken);
    if (!marketPair) {
        throw new Error(`Unsupported market pair: ${sentSwap.receiveToken}/${sentSwap.sendToken}`);
    }

    const marketDetails = MarketPairs.get(marketPair);
    if (!marketDetails) {
        throw new Error(`Unsupported market pair: ${marketPair}`);
    }

    const side = sentSwap.receiveToken === marketDetails.base ? OrderSide.BUY : OrderSide.SELL;

    const sendTokenDetails = Tokens.get(sentSwap.sendToken);
    if (!sendTokenDetails) {
        throw new Error(`Unsupported token: ${sentSwap.sendToken}`);
    }

    const receiveTokenDetails = Tokens.get(sentSwap.receiveToken);
    if (!receiveTokenDetails) {
        throw new Error(`Unsupported token: ${sentSwap.receiveToken}`);
    }

    let newOrderPrice: BigNumber;
    let newOrderVolume: BigNumber;
    let newOrderMinimumFill: BigNumber;

    const receiveVolumeBig = shiftDecimals(new BigNumber(sentSwap.receiveAmount), -receiveTokenDetails.decimals);
    const sendVolumeBig = shiftDecimals(new BigNumber(sentSwap.sendAmount), -sendTokenDetails.decimals);
    const mininimumReceiveFillBig = shiftDecimals(new BigNumber(sentSwap.minimumReceiveAmount || "0"), -receiveTokenDetails.decimals);
    // const minimum

    if (side === OrderSide.BUY) {
        newOrderPrice = shiftDecimals(sendVolumeBig.dividedBy(receiveVolumeBig), renexNode.DECIMAL_PRECISION);
        newOrderVolume = shiftDecimals(sendVolumeBig, renexNode.DECIMAL_PRECISION);
        newOrderMinimumFill = mininimumReceiveFillBig.times(newOrderPrice); // Don't shift because price is shifted
    } else {
        newOrderPrice = shiftDecimals(receiveVolumeBig.dividedBy(sendVolumeBig), renexNode.DECIMAL_PRECISION);
        newOrderVolume = shiftDecimals(receiveVolumeBig, renexNode.DECIMAL_PRECISION);
        newOrderMinimumFill = shiftDecimals(mininimumReceiveFillBig, renexNode.DECIMAL_PRECISION);
    }

    const newOrder: renexNode.NewOrder = {
        marketID: `${marketDetails.base}-${marketDetails.quote}`,
        volume: new BN(newOrderVolume.decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed()),
        price: new BN(newOrderPrice.decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed()), // 350,
        minimumFill: new BN(newOrderMinimumFill.decimalPlaces(0, BigNumber.ROUND_DOWN).toFixed()), // 10,
    };

    console.log({
        volume: newOrder.volume.toString(),
        price: newOrder.price.toString(),
        minimumFill: newOrder.minimumFill.toString(),
    });

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
        orderFragmentMappings = await renexNode.buildOrderMapping(
            sdk.getWeb3(),
            sdk._networkData.renexNode,
            sdk._contracts.darknodeRegistry,
            newOrder,
            simpleConsole,
        );
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    const request = new renexNode.OpenOrderRequest({
        orderID: sentSwap.delayInfo.orderID,
        sendToken: sendTokenDetails.symbol,
        receiveToken: receiveTokenDetails.symbol,
        encryptedShares: orderFragmentMappings,
    });

    console.log(JSON.stringify(request.toJS(), null, "    "));

    try {
        await renexNode.submitOrderFragments(sdk._networkData.renexNode, request, options.token);
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    return sentSwap;
};
