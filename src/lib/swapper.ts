import axios from "axios";
import Web3 from "web3";

import { OrderStatus } from "../types";
import { EncodedData, Encodings } from "./encodedData";
import { ErrSignatureCanceledByUser, ErrUnsignedTransaction } from "./errors";
import { AtomAuthorizationRequest, authorizeSwapper } from "./ingress";

const API = "http://localhost:7928";
const SIGNATURE_PREFIX = "RenEx: swapperd: ";

export const ErrorAtomNotLinked = "Atom back-end not linked to wallet";
export const ErrorUnableToConnect = "Unable to connect go Atom back-end";
export const ErrorAddressNotAuthorized = "Ethereum address not authorized for Atom";
export const ErrorUnableToRetrieveStatus = "Unable to retrieve order status";
export const ErrorUnableToRetrieveSwaps = "Unable to retrieve swaps";
export const ErrorUnableToRetrieveBalances = "Unable to retrieve Atomic balances";

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

// interface OrdersParameters {
//     orderID: string; // hexadecimal
// }

// interface OrdersResponse {
//     orderID: string;
//     signature: string;
// }

interface BalanceObject {
    address: string;
    balance: string;
}

interface BalancesResponse {
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

export async function _authorizeAtom(web3: Web3, ingressURL: string, atomAddress: string, address: string): Promise<void> {
    throw new Error("Unimplemented");
    const req = await getAtomAuthorizationRequest(web3, atomAddress, address);
    await authorizeSwapper(ingressURL, req);
}

async function getAtomAuthorizationRequest(web3: Web3, atomAddress: string, address: string): Promise<AtomAuthorizationRequest> {
    throw new Error("Unimplemented");
    const prefix: string = "RenEx: authorize: ";
    const checkedAddress = new EncodedData(atomAddress, Encodings.HEX);
    const message = prefix + checkedAddress.toString();
    const signature = await signMessage(web3, address, message);
    return new AtomAuthorizationRequest({ atomAddress: checkedAddress.toHex(), signature });
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

function toOrderStatus(status: SwapStatus): OrderStatus {
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

export interface SwapBlob extends SwapCore {
    minimumReceiveAmount?: string;
    sendTo?: string;
    receiveFrom?: string;
    timeLock?: number;
    secretHash?: string;
    shouldInitiateFirst?: boolean;
    delayCallbackUrl: string;
    brokerFee?: number;
}

export interface SwapReceipt extends SwapCore {
    // tslint:disable-next-line:no-any
    sendCost: any;
    // tslint:disable-next-line:no-any
    receiveCost: any;
    timestamp: number;
    status: number;
}

export async function submitSwap(swap: SwapBlob, network: string): Promise<string> {
    console.log(JSON.stringify(swap));
    const resp = await axios.post(`${API}/swaps?network=${network}`, swap);
    console.log(resp.data);
    // FIXME: use actual swap id
    return "swap-id";
}

export async function getOrderStatus(orderID: EncodedData, network: string): Promise<OrderStatus> {
    let response: { swaps: SwapReceipt[] };
    try {
        response = (await axios.get(`${API}/swaps?network=${network}`)).data;
    } catch (error) {
        console.error(error);
        throw new Error(ErrorUnableToRetrieveSwaps);
    }

    for (const swap of response.swaps) {
        if (swap.delay && swap.delayInfo.message.orderID === orderID.toBase64()) {
            return toOrderStatus(toSwapStatus(swap.status));
        }
    }

    console.error(`Couldn't find a swap with matching orderID: ${orderID}`);
    throw new Error(ErrorUnableToRetrieveStatus);
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
