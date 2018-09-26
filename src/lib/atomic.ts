import axios from "axios";
import crypto from "crypto";
import Web3 from "web3";

// import { second, sleep } from "@Library/conversion";
import { OrderStatus } from "../types";
import { EncodedData, Encodings } from "./encodedData";
import { ErrCanceledByUser, ErrUnsignedTransaction } from "./errors";
import { AtomAuthorizationRequest, authorizeSwapper, checkAtomAuthorization } from "./ingress";
// import { Order } from "@Library/ingress";
// import { NetworkData } from "@Library/network";

const API = "http://localhost:18516";

export const ErrorAtomNotLinked = "Atom back-end not linked to wallet";
export const ErrorUnableToConnect = "Unable to connect go Atom back-end";
export const ErrorAddressNotAuthorized = "Ethereum address not authorized for Atom";
export const ErrorUnableToRetrieveStatus = "Unable to retrieve order status";
export const ErrorUnableToRetrieveBalances = "Unable to retrieve Atomic balances";

export enum AtomicConnectionStatus {
    InvalidSwapper = "invalid_swapper",
    NotConnected = "not_connected",
    NotAuthorized = "not_authorized",
    AtomNotAuthorized = "atom_not_authorized",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
}

interface StatusResponse {
    order_id: string;
    status: OrderStatus;
}

interface WhoamiResponse {
    whoAmI: {
        challenge: string;
        version: string;
        authorizedAddresses: string[];
        supportedCurrencies: string[];
    };
    signature: string;
}

interface OrdersParameters {
    orderID: string; // hexadecimal
}

interface OrdersResponse {
    orderID: string;
    signature: string;
}

interface BalanceObject {
    address: string;
    amount: string;
}

interface BalancesResponse {
    ethereum: BalanceObject;
    bitcoin: BalanceObject;
}

export function checkSigner(web3: Web3, response: WhoamiResponse): string {
    const message = JSON.stringify(response.whoAmI);
    const whoamiString = "\x19Ethereum Signed Message:\n" + message.length + message;
    const hash = web3.utils.keccak256(whoamiString);
    const r = "0x" + response.signature.slice(0, 64);
    const s = "0x" + response.signature.slice(64, 128);
    const recovery = "0x" + response.signature.slice(128, 130);
    const v = "0x" + (parseInt(recovery, 16) + 27).toString(16);
    // tslint:disable-next-line:no-any
    return (web3.eth.accounts as any).recover({
        messageHash: hash,
        r,
        s,
        v,
    });
}

export async function challengeSwapper(): Promise<WhoamiResponse> {
    const challenge = crypto.randomBytes(20).toString("hex");

    const response: WhoamiResponse = await axios.get(`${API}/whoami/${challenge}`).then(resp => resp.data);
    if (response === undefined ||
        response.whoAmI === undefined ||
        response.whoAmI.authorizedAddresses === undefined ||
        response.whoAmI.authorizedAddresses === null) {
        throw new Error("Failed the swapper whoami challenge.");
    }
    return response;
}

export async function _connectToAtom(response: WhoamiResponse, ingressURL: string, address: string): Promise<AtomicConnectionStatus> {
    const authorizedAddresses = response.whoAmI.authorizedAddresses.map(addr => {
        return new EncodedData(addr, Encodings.HEX).toHex().toLowerCase();
    });
    const comparisonAddress = new EncodedData(address, Encodings.HEX).toHex().toLowerCase();
    if (authorizedAddresses.indexOf(comparisonAddress) === -1) {
        // TODO: Inform user address is not authorized
        return AtomicConnectionStatus.NotAuthorized;
    }

    // TODO: Use web3 from store
    // const msg = "0x" + new Buffer(JSON.stringify(response.whoAmI)).toString("hex");
    // const chaHash = web3.utils.keccak256(msg);
    // const swapperAddress = web3.eth.accounts.recover(chaHash, "0x" + response.signature, true as any);
    const expectedEthAddress = await getAtomicBalances().then(resp => resp.ethereum.address);

    // Check with Ingress if Atomic address is authorized
    const atomAuthorized = await checkAtomAuthorization(ingressURL, address, expectedEthAddress);
    if (atomAuthorized) {
        return AtomicConnectionStatus.ConnectedUnlocked;
    }

    return AtomicConnectionStatus.AtomNotAuthorized;
}

export async function _authorizeAtom(web3: Web3, ingressURL: string, atomAddress: string, address: string): Promise<AtomicConnectionStatus> {
    const authorized = await getAtomAuthorizationRequest(web3, atomAddress, address).then(request => authorizeSwapper(ingressURL, request));
    if (authorized) {
        return AtomicConnectionStatus.ConnectedUnlocked;
    }
    return AtomicConnectionStatus.AtomNotAuthorized;
}

async function getAtomAuthorizationRequest(web3: Web3, atomAddress: string, address: string): Promise<AtomAuthorizationRequest> {
    const prefix: string = web3.utils.toHex("RenEx: authorize: ");
    const checkedAddress = new EncodedData(atomAddress, Encodings.HEX);
    const hashForSigning: string = (prefix + checkedAddress.toHex(""));

    let signature: EncodedData;
    try {
        // tslint:disable-next-line:no-any
        signature = new EncodedData(await (web3.eth.personal.sign as any)(hashForSigning, address));
    } catch (error) {
        if (error.message.match(/User denied message signature/)) {
            return Promise.reject(new Error(ErrCanceledByUser));
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

    return new AtomAuthorizationRequest({ atomAddress: checkedAddress.toHex(), signature: buff.toString("base64") });
}

export async function submitOrderToAtom(orderID: EncodedData): Promise<void> {

    // orderID and signature should be hex-encoded
    const data: OrdersParameters = {
        orderID: orderID.toHex(""),
    };

    let response: OrdersResponse;
    try {
        response = (await axios.post(`${API}/orders`, data)).data;
    } catch (error) {
        throw error;
    }

    if (response.orderID !== data.orderID) {
        throw new Error("Invalid order ID returned by Atom");
    }

    // TODO: Check response.signature against Atom's address
}

export async function getOrderStatus(orderID: EncodedData): Promise<OrderStatus> {

    let response: StatusResponse;
    try {
        response = (await axios.get(`${API}/status/${orderID.toHex("")}`)).data;
    } catch (error) {
        console.error(error);
        throw new Error(ErrorUnableToRetrieveStatus);
    }

    // if (response.order_id !== orderID.toHex()) {
    //     console.error(`Unexpected order ID returned from /status GET request to Atom`);
    //     throw new Error(ErrorUnableToRetrieveStatus);
    // }

    return response.status;
}

export async function getAtomicBalances(): Promise<BalancesResponse> {

    let response: BalancesResponse;
    try {
        response = (await axios.get(`${API}/balances`)).data;
    } catch (error) {
        console.error(error);
        throw new Error(ErrorUnableToRetrieveStatus);
    }

    return response;
}
