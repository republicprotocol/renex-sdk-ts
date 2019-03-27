import axios from "axios";

import { errors, responseError, updateError } from "../errors";
import { Token } from "./tokens";
import { ReturnedSwap, SentSwap, SubmitImmediateResponse, SwapStatus, UnfixedReturnedSwap } from "./types/swapObject";

const API = "http://localhost:7928";
// const SIGNATURE_PREFIX = "RenEx: swapperD: ";

export enum SwapperConnectionStatus {
    NotConnected = "not_connected",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
    // NotAuthorized = "not_authorized",
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

export interface SwapsResponse {
    swaps: UnfixedReturnedSwap[];
}

export const fetchSwapperVersion = async (network: string): Promise<string> => {
    return (await axios.get(`${API}/version`)).data;
};

export const fetchSwapperAddress = async (network: string): Promise<string> => {
    return (await axios.get(`${API}/id/eth?network=${network}`)).data;
};

export async function fetchSwapperStatus(network: string, renexNode: string, getSwapperID: () => Promise<string>): Promise<SwapperConnectionStatus> {
    try {
        const response: InfoResponse = (await axios.get(`${API}/info?network=${network}`)).data;
        if (response.bootloaded) {
            // try {
            //     const swapperID = await getSwapperID();
            //     await axios.get(`${renexNode}/kyc/${swapperID}`);
            // } catch (error) {
            //     return SwapperConnectionStatus.NotAuthorized;
            // }

            return SwapperConnectionStatus.ConnectedUnlocked;
        }
        return SwapperConnectionStatus.ConnectedLocked;
    } catch (error) {
        if (error.response && error.response.status === 401) {
            return SwapperConnectionStatus.ConnectedLocked;
        }
        return SwapperConnectionStatus.NotConnected;
    }
}

export function toSwapStatus(num: number): SwapStatus {

    switch (num) {
        case 0:
            return SwapStatus.INACTIVE;
        case 1:
            return SwapStatus.INITIATED;
        case 2:
            return SwapStatus.AUDITED;
        case 3:
            return SwapStatus.AUDIT_PENDING;
        case 4:
            return SwapStatus.AUDIT_FAILED;
        case 5:
            return SwapStatus.REDEEMED;
        case 6:
            return SwapStatus.AUDITED_SECRET;
        case 7:
            return SwapStatus.REFUNDED;
        case 8:
            return SwapStatus.REFUND_FAILED;
        case 9:
            return SwapStatus.CANCELLED;
        case 10:
            return SwapStatus.EXPIRED;
        default:
            throw new Error(`Invalid SwapStatus number: ${num}`);
    }
}

export async function submitSwap(swap: SentSwap, network: string): Promise<boolean | SubmitImmediateResponse> {
    let resp;

    try {
        resp = await axios.post(`${API}/swaps?network=${network}`, swap);
    } catch (error) {
        if (error.response && error.response.status === 403) {
            throw responseError(errors.UserRejectedSwap, error.response);
        }

        if (error.response && error.response.status !== 201) {
            throw responseError(errors.UnableToSubmitSwap, error.response);
        }
        throw error;
    }

    if (swap.delay !== undefined && swap.delay) {
        return true;
    }
    return resp.data as SubmitImmediateResponse;
}

export async function findMatchingReturnedSwap(check: (swap: ReturnedSwap) => boolean, network: string): Promise<ReturnedSwap> {
    let response: { swaps: UnfixedReturnedSwap[] };
    try {
        response = (await axios.get(`${API}/swaps?network=${network}`)).data;
    } catch (error) {
        throw updateError(errors.UnableToRetrieveSwaps, error);
    }

    for (const innerSwap of response.swaps) {
        const swap: ReturnedSwap = fixSwapType(innerSwap);
        try {
            if (check(swap)) {
                return swap;
            }
        } catch (error) {
            // Ignore error
        }
    }
    throw new Error(errors.UnableToFindMatchingSwap);
}

export async function getSwapperDAddresses(tokens: Token[], options: { network: string }): Promise<string[]> {

    const addresses = await Promise.all(tokens.map(async (token) => {
        return (await axios.get(`${API}/addresses/${token}?network=${options.network}`)).data;
    }));

    return addresses;
}

export async function getSwapperDBalances(options: { network: string }): Promise<BalancesResponse> {

    let response: BalancesResponse;
    try {
        response = (await axios.get(`${API}/balances?network=${options.network}`)).data;
    } catch (error) {
        throw updateError(`${errors.UnableToRetrieveStatus}: ${error.message || error}`, error);
    }

    return response;
}

export async function getSwapperDSwaps(options: { network: string }): Promise<SwapsResponse> {
    let response: SwapsResponse;
    try {
        response = (await axios.get(`${API}/swaps?network=${options.network}`)).data;
    } catch (error) {
        throw updateError(`${errors.UnableToRetrieveSwaps}: ${error.message || error}`, error);
    }

    return response;
}

export function fixSwapType(swap: UnfixedReturnedSwap): ReturnedSwap {
    const { status, ...details } = swap;
    const result: ReturnedSwap = Object.assign({ status: toSwapStatus(status) }, details);
    return result;
}
