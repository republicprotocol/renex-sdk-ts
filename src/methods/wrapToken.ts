import axios from "axios";
import BigNumber from "bignumber.js";
import BN from "bn.js";

import { toWei } from "web3-utils";

import RenExSDK from "../index";

import { SentSwap, SubmitImmediateResponse } from "lib/types/swapObject";
import { errors, updateError } from "../errors";
import { getSwapperDBalances, submitSwap } from "../lib/swapper";
import { toSmallestUnit } from "../lib/tokens";
import { MarketPair, NumberInput, OrderInputs, OrderSide, OrderStatus, Token, WBTCOrder } from "../types";

// Required ETH balance for fees
const MIN_ETH_BALANCE = 0.005;

// The fee required to be in the server balance for initiation
const serverInitiateFeeSatoshi = 10000;

export interface WrapFees {
    wrapFees: number; // in BIPS
    unwrapFees: number; // in BIPS
}

export interface WrapFeesMap {
    [token: string]: WrapFees;
}

type FeesResponse = WrapFeesMap;

interface BalanceResponse {
    [token: string]: {
        address: string;
        balance: string;
    };
}

function wrapped(token: Token): Token {
    switch (token) {
        case Token.BTC:
            return Token.WBTC;
        default:
            throw new Error(`No wrapped version of token: ${token}`);
    }
}

function unwrapped(token: Token): Token {
    switch (token) {
        case Token.WBTC:
            return Token.BTC;
        default:
            throw new Error(`No unwrapped version of token: ${token}`);
    }
}

export async function getWrappingFees(sdk: RenExSDK, token: Token): Promise<WrapFees> {
    if (sdk._wrappingFees[token]) {
        return sdk._wrappingFees[token];
    }

    let response: FeesResponse;
    try {
        response = (await axios.get(`${sdk._networkData.wbtcKYCServer}/fees`)).data;
    } catch (error) {
        throw updateError(errors.CouldNotConnectSwapServer, error);
    }

    if (!response[token]) {
        throw new Error(`${token} not listed by Swap server while fetching fees`);
    }

    sdk._wrappingFees[token] = response[token];

    return response[token];
}

/**
 *
 *
 * @param {RenExSDK} sdk
 * @param {BigNumber} amount in the smallest possible token unit
 * @param {string} fromToken
 */
async function checkSufficientServerBalance(amount: BigNumber, response: BalanceResponse, toToken: Token, amountString: string): Promise<boolean> {
    // The fee required to be in the server for initiation
    const initiateFee = new BigNumber(serverInitiateFeeSatoshi);
    const serverTokenBalance = BigNumber.max(0, new BigNumber(response[toToken].balance).minus(initiateFee));
    const serverEthBalance = new BigNumber(response.ETH.balance);
    let err;
    if (serverTokenBalance.lt(amount)) {
        err = `Swap server has insufficient balance to swap ${amountString} ${toToken}`;
        const error = new Error(err);
        // tslint:disable-next-line: no-any
        (error as any).serverTokenBalance = serverTokenBalance;
        // tslint:disable-next-line: no-any
        (error as any).amount = amount;
        throw error;
    }
    if (serverEthBalance.lt(toWei(MIN_ETH_BALANCE.toString()))) {
        err = `Swap server has insufficient Ethereum balance for transfer fees`;
        const error = new Error(err);
        // tslint:disable-next-line: no-any
        (error as any).serverTokenBalance = serverTokenBalance;
        // tslint:disable-next-line: no-any
        (error as any).amount = amount;
        throw error;
    }
    return true;
}

/**
 *
 *
 * @param {RenExSDK} sdk
 * @param {BigNumber} amount in the smallest possible token unit
 * @param {string} fromToken the token to be wrapped or unwrapped
 */
async function checkSufficientUserBalance(sdk: RenExSDK, amount: BigNumber, fromToken: Token): Promise<boolean> {
    const balances = await getSwapperDBalances({ network: sdk._networkData.network });
    const fromTokenBalance = new BigNumber(balances[fromToken].balance);
    if (fromTokenBalance.lt(amount)) {
        throw new Error(`User has insufficient ${fromToken} balance in Swapper`);
    }
    return true;
}

// tslint:disable-next-line:no-any
async function convert(sdk: RenExSDK, orderInputs: OrderInputs, conversionFeePercent: BigNumber): Promise<WBTCOrder> {
    const tokens = orderInputs.symbol.split("/");

    let fromToken: Token;
    let toToken: Token;
    if (orderInputs.side === OrderSide.BUY) {
        ([toToken, fromToken] = tokens as [Token, Token]);
    } else if (orderInputs.side === OrderSide.SELL) {
        ([fromToken, toToken] = tokens as [Token, Token]);
    } else {
        throw new Error(`Unknown order side: ${orderInputs.side}`);
    }

    let response: BalanceResponse;
    try {
        response = (await axios.get(`${sdk._networkData.wbtcKYCServer}/balances`)).data;
    } catch (error) {
        throw updateError(errors.CouldNotConnectSwapServer, error);
    }
    const fromTokenDetails = sdk.tokenDetails.get(fromToken);
    if (!fromTokenDetails) {
        throw new Error(`Unknown token ${fromToken}`);
    }
    const amountBigNumber = toSmallestUnit(orderInputs.volume, fromTokenDetails.decimals);
    await checkSufficientServerBalance(amountBigNumber, response, toToken, orderInputs.volume.toString());
    await checkSufficientUserBalance(sdk, amountBigNumber, fromToken);
    const brokerFee = conversionFeePercent.times(10000).toNumber();

    const req: SentSwap = {
        sendTo: response[fromToken].address,
        receiveFrom: response[toToken].address,
        sendToken: fromToken,
        receiveToken: toToken,
        sendAmount: amountBigNumber.toFixed(),
        receiveAmount: amountBigNumber.toFixed(),
        shouldInitiateFirst: true,
        // FIXME: The broker is currently the KYC swap server but in the future it could be different
        brokerFee,
        brokerSendTokenAddr: response[fromToken].address,
        brokerReceiveTokenAddr: response[toToken].address,
        delay: false,
    };
    const swapResponse: SubmitImmediateResponse = await submitSwap(req, sdk._networkData.network) as SubmitImmediateResponse;
    try {
        await axios.post(`${sdk._networkData.wbtcKYCServer}/swaps`, swapResponse);
    } catch (error) {
        throw updateError(errors.CouldNotConnectSwapServer, error);
    }

    const swap: WBTCOrder = {
        swapServer: true,
        orderInputs,
        status: OrderStatus.CONFIRMED,
        trader: sdk.getAddress(),
        id: swapResponse.id,
        computedOrderDetails: {
            spendToken: fromToken,
            receiveToken: toToken,
            spendVolume: new BigNumber(orderInputs.volume),
            receiveVolume: new BigNumber(orderInputs.volume),
            date: Math.floor(new Date().getTime() / 1000),
            feeAmount: new BigNumber(orderInputs.volume).times(conversionFeePercent),
            feeToken: fromToken,
            nonce: new BN(0),
        },
    };

    return swap;
}

// tslint:disable-next-line:no-any
export async function wrap(sdk: RenExSDK, amount: NumberInput, fromToken: Token): Promise<WBTCOrder> {
    const toToken = wrapped(fromToken);

    const orderDetails: OrderInputs = {
        symbol: `${toToken}/${fromToken}` as MarketPair, // The trading pair symbol e.g. "ETH/BTC" in base token / quote token
        side: OrderSide.BUY,
        price: 1,
        volume: amount,
    };

    return convert(sdk, orderDetails, await wrappingFees(sdk, toToken));
}

// tslint:disable-next-line:no-any
export async function unwrap(sdk: RenExSDK, amount: NumberInput, fromToken: Token): Promise<WBTCOrder> {
    const toToken = unwrapped(fromToken);

    const orderDetails: OrderInputs = {
        symbol: `${fromToken}/${toToken}` as MarketPair, // The trading pair symbol e.g. "ETH/BTC" in base token / quote token
        side: OrderSide.SELL,
        price: 1,
        volume: amount,
    };

    return convert(sdk, orderDetails, await unwrappingFees(sdk, fromToken));
}

export async function wrappingFees(sdk: RenExSDK, token: Token): Promise<BigNumber> {
    const wrapFees = await getWrappingFees(sdk, token);
    return Promise.resolve(new BigNumber(wrapFees.wrapFees).dividedBy(10000));
}

export async function unwrappingFees(sdk: RenExSDK, token: Token): Promise<BigNumber> {
    const wrapFees = await getWrappingFees(sdk, token);
    return Promise.resolve(new BigNumber(wrapFees.unwrapFees).dividedBy(10000));
}
