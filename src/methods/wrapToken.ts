import axios from "axios";
import BigNumber from "bignumber.js";

import { toWei } from "web3-utils";

import RenExSDK from "../index";

import { errors, updateError } from "../errors";
import { getSwapperDBalances, submitSwap } from "../lib/swapper";
import { Token, toSmallestUnit } from "../lib/tokens";
import { SentNonDelayedSwap, SubmitImmediateResponse } from "../lib/types/swapObject";
import { NumberInput, OrderInputs } from "../types";
import { populateOrderDefaults } from "./openOrder";

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
async function convert(sdk: RenExSDK, orderInputsIn: OrderInputs, conversionFeePercent: BigNumber): Promise<SentNonDelayedSwap> {
    const orderInputs = populateOrderDefaults(orderInputsIn);

    if (!orderInputs.price.isEqualTo(1)) {
        throw new Error("Invalid inputs: price must be 1.");
    }

    let response: BalanceResponse;
    try {
        response = (await axios.get(`${sdk._networkData.wbtcKYCServer}/balances`)).data;
    } catch (error) {
        throw updateError(errors.CouldNotConnectSwapServer, error);
    }
    const fromTokenDetails = sdk.tokenDetails.get(orderInputs.sendToken);
    if (!fromTokenDetails) {
        throw new Error(`Unknown token ${orderInputs.sendToken}`);
    }
    const amountBigNumber = toSmallestUnit(orderInputs.sendVolume, fromTokenDetails.decimals);
    await checkSufficientServerBalance(amountBigNumber, response, orderInputs.receiveToken, orderInputs.sendVolume.toString());
    await checkSufficientUserBalance(sdk, amountBigNumber, orderInputs.sendToken);
    const brokerFee = conversionFeePercent.times(10000).toNumber();

    const sentSwap: SentNonDelayedSwap = {
        sendTo: response[orderInputs.sendToken].address,
        receiveFrom: response[orderInputs.receiveToken].address,
        sendToken: orderInputs.sendToken,
        receiveToken: orderInputs.receiveToken,
        sendAmount: amountBigNumber.toFixed(),
        receiveAmount: amountBigNumber.toFixed(),
        shouldInitiateFirst: true,
        // FIXME: The broker is currently the KYC swap server but in the future it could be different
        brokerFee,
        brokerSendTokenAddr: response[orderInputs.sendToken].address,
        brokerReceiveTokenAddr: response[orderInputs.receiveToken].address,
        delay: false,
    };
    const swapResponse: SubmitImmediateResponse = await submitSwap(sentSwap, sdk._networkData.network) as SubmitImmediateResponse;
    try {
        await axios.post(`${sdk._networkData.wbtcKYCServer}/swaps`, swapResponse);
    } catch (error) {
        throw updateError(errors.CouldNotConnectSwapServer, error);
    }

    return sentSwap;
}

// tslint:disable-next-line:no-any
export async function wrap(sdk: RenExSDK, amount: NumberInput, fromToken: Token): Promise<SentNonDelayedSwap> {
    const toToken = wrapped(fromToken);

    const orderDetails: OrderInputs = {
        sendToken: fromToken,
        receiveToken: toToken,
        price: 1,
        sendVolume: amount,
    };

    return convert(sdk, orderDetails, await wrappingFees(sdk, toToken));
}

// tslint:disable-next-line:no-any
export async function unwrap(sdk: RenExSDK, amount: NumberInput, fromToken: Token): Promise<SentNonDelayedSwap> {
    const toToken = unwrapped(fromToken);

    const orderDetails: OrderInputs = {
        sendToken: fromToken,
        receiveToken: toToken,
        price: 1,
        sendVolume: amount,
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