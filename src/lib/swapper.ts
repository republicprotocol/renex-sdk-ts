import axios from "axios";
import Web3 from "web3";

import { EncodedData } from "./encodedData";
import { ErrSignatureCanceledByUser, ErrUnsignedTransaction } from "./errors";

const API = "http://localhost:7928";
const SIGNATURE_PREFIX = "RenEx: swapperd: ";

const ErrorUnableToRetrieveStatus = "Unable to retrieve order status";
const ErrorUnableToRetrieveSwaps = "Unable to retrieve swaps";
const ErrorUnableToFindMatchingSwap = "Unable to find matching swap";

export enum SwapperConnectionStatus {
    NotConnected = "not_connected",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
}

interface InfoResponse {
    version: string;
    bootloaded: boolean;
    supportedBlockchains: Array<{ name: string, address: string }>;
    supportedTokens: Array<{ name: string, blockchain: string }>;
}

interface BalanceObject {
    address: string;
    balance: string;
}

export interface BalancesResponse {
    [token: string]: BalanceObject;
}

export async function fetchSwapperStatus(network: string): Promise<SwapperConnectionStatus> {
    try {
        const response: InfoResponse = (await axios.get(`${API}/info?network=${network}`)).data;
        if (response.bootloaded) {
            return SwapperConnectionStatus.ConnectedUnlocked;
        }
        return SwapperConnectionStatus.ConnectedLocked;
    } catch (error) {
        return SwapperConnectionStatus.NotConnected;
    }
}

export enum SwapStatus {
    INACTIVE = "inactive",
    INITIATED = "initiated",
    AUDITED = "audited",
    AUDIT_FAILED = "audit_failed",
    REDEEMED = "redeemed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
}

function toSwapStatus(num: number): SwapStatus {
    switch (num) {
        case 0:
            return SwapStatus.INACTIVE;
        case 1:
            return SwapStatus.INITIATED;
        case 2:
            return SwapStatus.AUDITED;
        case 3:
            return SwapStatus.AUDIT_FAILED;
        case 4:
            return SwapStatus.REDEEMED;
        case 5:
            return SwapStatus.REFUNDED;
        case 6:
            return SwapStatus.CANCELLED;
        case 7:
            return SwapStatus.EXPIRED;
        default:
            throw new Error(`Invalid SwapStatus number: ${num}`);
    }
}
interface SwapCore {
    id?: string;
    sendToken?: string;
    receiveToken?: string;
    sendAmount?: string;
    receiveAmount?: string;
    delay?: boolean;
    // tslint:disable-next-line:no-any
    delayInfo?: any;
}

export interface SwapBlob extends SwapCore {
    minimumReceiveAmount?: string;
    sendTo?: string;
    receiveFrom?: string;
    timeLock?: number;
    secretHash?: string;
    shouldInitiateFirst?: boolean;
    delayCallbackUrl?: string;
    brokerFee?: number;
    sendFee?: string;
    receiveFee?: string;
}

interface InnerSwapReceipt extends SwapCore {
    // tslint:disable-next-line:no-any
    sendCost: any;
    // tslint:disable-next-line:no-any
    receiveCost: any;
    timestamp: number;
    status: number;
}

/**
 * This replaces the InnerSwapReceipt status from type number to type SwapStatus
 */
export interface SwapReceipt extends Pick<InnerSwapReceipt, Exclude<keyof InnerSwapReceipt, "status">> {
    status: SwapStatus;
}

export async function submitSwap(swap: SwapBlob, network: string): Promise<string> {
    console.log(JSON.stringify(swap));
    const resp = await axios.post(`${API}/swaps?network=${network}`, swap);
    console.log(resp.data);
    // FIXME: use actual swap id
    return "swap-id";
}

export async function findMatchingSwapReceipt(check: (swap: SwapReceipt) => boolean, network: string): Promise<SwapReceipt> {
    let response: { swaps: InnerSwapReceipt[] };
    try {
        response = (await axios.get(`${API}/swaps?network=${network}`)).data;
    } catch (error) {
        console.error(error);
        throw new Error(ErrorUnableToRetrieveSwaps);
    }

    for (const innerSwap of response.swaps) {
        const swap: SwapReceipt = fixSwapType(innerSwap);
        if (check(swap)) {
            return swap;
        }
    }
    throw new Error(ErrorUnableToFindMatchingSwap);
}

export async function getAtomicBalances(options: { network: string }): Promise<BalancesResponse> {

    let response: BalancesResponse;
    try {
        response = (await axios.get(`${API}/balances?network=${options.network}`)).data;
    } catch (error) {
        console.error(error);
        throw new Error(ErrorUnableToRetrieveStatus);
    }

    return response;
}

async function signMessage(web3: Web3, address: string, message: string): Promise<string> {
    const hashForSigning: string = web3.utils.toHex(message);
    let signature: EncodedData;
    try {
        // tslint:disable-next-line:no-any
        signature = new EncodedData(await (web3.eth.personal.sign as any)(hashForSigning, address));
    } catch (error) {
        if (error.message.match(/User denied message signature/)) {
            return Promise.reject(new Error(ErrSignatureCanceledByUser));
        }
        return Promise.reject(new Error(ErrUnsignedTransaction));
    }

    const buff = signature.toBuffer();
    // Normalize v to be 0 or 1 (NOTE: Orderbook contract expects either format,
    // but for future compatibility, we stick to one format)
    // MetaMask gives v as 27 or 28, Ledger gives v as 0 or 1
    if (buff[64] === 27 || buff[64] === 28) {
        buff[64] = buff[64] - 27;
    }

    return buff.toString("base64");
}

export async function generateSignature(
    web3: Web3,
    address: string,
    message: {
        orderID: string;
        kycAddr: string;
        sendTokenAddr: string;
        receiveTokenAddr: string;
    },
): Promise<string> {
    const toSign = SIGNATURE_PREFIX + JSON.stringify(message);
    return signMessage(web3, address, toSign);
}

function fixSwapType(swap: InnerSwapReceipt): SwapReceipt {
    const { status, ...details } = swap;
    const result: SwapReceipt = Object.assign({ status: toSwapStatus(status) }, details);
    return result;
}
