import axios from "axios";
import BigNumber from "bignumber.js";

import RenExSDK, { NumberInput, Token } from "../index";

import { getAtomicBalances, submitSwap, SubmitSwapResponse, SwapBlob } from "../lib/swapper";
import { toSmallestUnit } from "../lib/tokens";
import { getTokenDetails } from "./balancesMethods";

const API = "https://swapperd-kyc-server.herokuapp.com";
const MIN_ETH_BALANCE = 0.5;

const ErrorCouldNotConnectSwapServer = "Could not connect to swap server";

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
    const serverTokenBalance = new BigNumber(response[toToken].balance);
    const serverEthBalance = new BigNumber(response.ETH.balance);
    if (serverTokenBalance.lt(amount)) {
        throw new Error(`Swap server has insufficient ${toToken} balance for the swap`);
    }
    if (serverEthBalance.lt(sdk.getWeb3().utils.toWei(MIN_ETH_BALANCE.toString()))) {
        throw new Error("Swap server has insufficient Ethereum balance for the swap");
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
async function convert(sdk: RenExSDK, amount: NumberInput, fromToken: string, toToken: string): Promise<any> {
    let response: BalanceResponse;
    try {
        response = (await axios.get(`${API}/balances`)).data;
    } catch (error) {
        console.error(error);
        throw new Error(ErrorCouldNotConnectSwapServer);
    }
    const fromTokenDetails = await getTokenDetails(sdk, fromToken);
    const amountBigNumber = toSmallestUnit(amount, fromTokenDetails);
    await checkSufficientServerBalance(sdk, amountBigNumber, response, toToken);
    await checkSufficientUserBalance(sdk, amountBigNumber, fromToken);

    const swapperBalances = await getAtomicBalances({ network: sdk._networkData.network });
    const req: SwapBlob = {
        sendTo: response[fromToken].address,
        receiveFrom: response[toToken].address,
        sendToken: fromToken,
        receiveToken: toToken,
        sendAmount: amountBigNumber.toFixed(),
        receiveAmount: amountBigNumber.toFixed(),
        minimumReceiveAmount: amountBigNumber.toFixed(),
        shouldInitiateFirst: true,
        brokerFee: 0,
        brokerReceiveTokenAddr: swapperBalances[fromToken].address,
        brokerSendTokenAddr: swapperBalances[toToken].address,
    };
    console.log(JSON.stringify(req));
    const swapResponse: SubmitSwapResponse = await submitSwap(req, sdk._networkData.network) as SubmitSwapResponse;
    try {
        const finalResponse = await axios.post(`${API}/swap`, swapResponse);
        console.log(JSON.stringify(finalResponse));
        return finalResponse;
    } catch (error) {
        console.error(error);
        throw new Error(ErrorCouldNotConnectSwapServer);
    }
}

// tslint:disable-next-line:no-any
export async function wrap(sdk: RenExSDK, amount: NumberInput, fromToken: string): Promise<any> {
    const toToken = wrapped(fromToken);
    return convert(sdk, amount, fromToken, toToken);
}

// tslint:disable-next-line:no-any
export async function unwrap(sdk: RenExSDK, amount: NumberInput, fromToken: string): Promise<any> {
    const toToken = unwrapped(fromToken);
    return convert(sdk, amount, fromToken, toToken);
}
