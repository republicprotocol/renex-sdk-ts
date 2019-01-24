import axios from "axios";
import BigNumber from "bignumber.js";
import BN from "bn.js";

import RenExSDK, { NumberInput, Token } from "../index";

import { errors, updateError } from "../errors";
import { getAtomicBalances, SubmitImmediateResponse, submitSwap, SwapBlob } from "../lib/swapper";
import { toSmallestUnit } from "../lib/tokens";
import { LATEST_TRADER_ORDER_VERSION } from "../storage/serializers";
import { OrderInputs, OrderSettlement, OrderSide, OrderStatus, WBTCOrder } from "../types";
import { getTokenDetails } from "./balancesMethods";

const MIN_ETH_BALANCE = 0.5;
const WRAPPING_FEE_BIPS = 10;
// The fee required to be in the server balance for initiation
const serverInitiateFeeSatoshi = 10000;

interface BalanceResponse {
    [token: string]: {
        address: string,
        balance: string,
    };
}

function wrapped(token: string): string {
    switch (token) {
        case Token.BTC:
            return Token.WBTC;
        default:
            throw new Error(`No wrapped version of token: ${token}`);
    }
}

function unwrapped(token: string): string {
    switch (token) {
        case Token.WBTC:
            return Token.BTC;
        default:
            throw new Error(`No unwrapped version of token: ${token}`);
    }
}

/**
 *
 *
 * @param {RenExSDK} sdk
 * @param {BigNumber} amount in the smallest possible token unit
 * @param {string} fromToken
 */
async function checkSufficientServerBalance(sdk: RenExSDK, amount: BigNumber, response: BalanceResponse, toToken: string): Promise<boolean> {
    // The fee required to be in the server for initiation
    const initiateFee = new BigNumber(serverInitiateFeeSatoshi);
    const serverTokenBalance = BigNumber.max(0, new BigNumber(response[toToken].balance).minus(initiateFee));
    const serverEthBalance = new BigNumber(response.ETH.balance);
    let err;
    if (serverTokenBalance.lt(amount)) {
        err = `Swap server has insufficient ${toToken} balance for the swap`;
        console.error(err);
        throw new Error(err);
    }
    if (serverEthBalance.lt(sdk.getWeb3().utils.toWei(MIN_ETH_BALANCE.toString()))) {
        err = "Swap server has insufficient Ethereum balance for the swap";
        console.error(err);
        throw new Error(err);
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
async function checkSufficientUserBalance(sdk: RenExSDK, amount: BigNumber, fromToken: string): Promise<boolean> {
    const balances = await getAtomicBalances({ network: sdk._networkData.network });
    const fromTokenBalance = new BigNumber(balances[fromToken].balance);
    if (fromTokenBalance.lt(amount)) {
        throw new Error(`User has insufficient ${fromToken} balance in Swapper`);
    }
    return true;
}

// tslint:disable-next-line:no-any
async function convert(sdk: RenExSDK, orderInputs: OrderInputs, conversionFeePercent: BigNumber): Promise<WBTCOrder> {
    const tokens = orderInputs.symbol.split("/");

    let fromToken: string;
    let toToken: string;
    if (orderInputs.side === OrderSide.BUY) {
        ([toToken, fromToken] = tokens);
    } else if (orderInputs.side === OrderSide.SELL) {
        ([fromToken, toToken] = tokens);
    } else {
        throw new Error(`Unknown order side: ${orderInputs.side}`);
    }

    let response: BalanceResponse;
    try {
        response = (await axios.get(`${sdk._networkData.wbtcKYCServer}/balances`)).data;
    } catch (error) {
        throw updateError(errors.CouldNotConnectSwapServer, error);
    }
    const fromTokenDetails = await getTokenDetails(sdk, fromToken);
    const amountBigNumber = toSmallestUnit(orderInputs.volume, fromTokenDetails);
    await checkSufficientServerBalance(sdk, amountBigNumber, response, toToken);
    await checkSufficientUserBalance(sdk, amountBigNumber, fromToken);
    const brokerFee = (await wrappingFees(sdk)).times(10000).toNumber();

    const req: SwapBlob = {
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
    };
    const swapResponse: SubmitImmediateResponse = await submitSwap(req, sdk._networkData.network) as SubmitImmediateResponse;
    try {
        await axios.post(`${sdk._networkData.wbtcKYCServer}/swap`, swapResponse);
    } catch (error) {
        throw updateError(errors.CouldNotConnectSwapServer, error);
    }

    const swap: WBTCOrder = {
        swapServer: true,
        version: LATEST_TRADER_ORDER_VERSION,
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
            orderSettlement: OrderSettlement.RenExAtomic,
            nonce: new BN(0),
        },
    };

    sdk._storage.setOrder(swap).catch(console.error);

    return swap;
}

// tslint:disable-next-line:no-any
export async function wrap(sdk: RenExSDK, amount: NumberInput, fromToken: string): Promise<WBTCOrder> {
    const toToken = wrapped(fromToken);

    const orderDetails: OrderInputs = {
        symbol: `${toToken}/${fromToken}`,      // The trading pair symbol e.g. "ETH/BTC" in base token / quote token
        side: OrderSide.BUY,
        price: 1,
        volume: amount,
    };

    return convert(sdk, orderDetails, await wrappingFees(sdk));
}

// tslint:disable-next-line:no-any
export async function unwrap(sdk: RenExSDK, amount: NumberInput, fromToken: string): Promise<WBTCOrder> {
    const toToken = unwrapped(fromToken);

    const orderDetails: OrderInputs = {
        symbol: `${fromToken}/${toToken}`,      // The trading pair symbol e.g. "ETH/BTC" in base token / quote token
        side: OrderSide.SELL,
        price: 1,
        volume: amount,
    };

    return convert(sdk, orderDetails, await wrappingFees(sdk));
}

export async function wrappingFees(sdk: RenExSDK): Promise<BigNumber> {
    return Promise.resolve(new BigNumber(WRAPPING_FEE_BIPS).dividedBy(10000));
}
