import axios from "axios";
import Web3 from "web3";

// import { second, sleep } from "@Library/conversion";
import { EncodedData, Encodings } from "./encodedData";
import { checkAtomAuthorization } from "./ingress";
// import { Order } from "@Library/ingress";
// import { NetworkData } from "@Library/network";

const API = "http://localhost:18516";

export const ErrorAtomNotLinked = "Atom back-end not linked to wallet";
export const ErrorUnableToConnect = "Unable to connect go Atom back-end";
export const ErrorAddressNotAuthorized = "Ethereum address not authorized for Atom";
export const ErrorUnableToRetrieveStatus = "Unable to retrieve order status";
export const ErrorUnableToRetrieveBalances = "Unable to retrieve Atomic balances";

export enum AtomicConnectionStatus {
    NotConnected = "not_connected",
    NotAuthorized = "not_authorized",
    AtomNotAuthorized = "atom_not_authorized",
    ConnectedUnlocked = "connected_unlocked",
    ConnectedLocked = "connected_locked",
}

export enum AtomicSwapStatus {
    Unknown = "UNKNOWN",
    Matched = "MATCHED",
    InfoSubmitted = "INFO_SUBMITTED",
    InitiateDetailsAcquired = "INITIATE_DETAILS_ACQUIRED",
    Initiated = "INITIATED",
    WaitingForCounterInitiation = "WAITING_FOR_COUNTER_INITIATION",
    RedeemDetailsAcquired = "REDEEM_DETAILS_ACQUIRED",
    Redeemed = "REDEEMED",
    WaitingForCounterRedemption = "WAITING_FOR_COUNTER_REDEMPTION",
    Refunded = "REFUNDED",
    Complained = "COMPLAINED",

    ReceivedSwapDetails = "RECEIVED_SWAP_DETAILS",
    SentSwapDetails = "SENT_SWAP_DETAILS",
    Audited = "AUDITED",
}

export const AtomicSwapStatusDisplay = {
    [AtomicSwapStatus.Unknown]: "",
    [AtomicSwapStatus.Matched]: "Pending...",
    [AtomicSwapStatus.InfoSubmitted]: "Information submitted",
    [AtomicSwapStatus.InitiateDetailsAcquired]: "Initiate-details acquired",
    [AtomicSwapStatus.Initiated]: "Initiated",
    [AtomicSwapStatus.WaitingForCounterInitiation]: "Waiting for counter-initiation",
    [AtomicSwapStatus.RedeemDetailsAcquired]: "Redeem-details acquired",
    [AtomicSwapStatus.Redeemed]: "Redeemed",
    [AtomicSwapStatus.WaitingForCounterRedemption]: "Waiting for counter-redemption",
    [AtomicSwapStatus.Refunded]: "Refunded",
    [AtomicSwapStatus.Complained]: "Complained",

    [AtomicSwapStatus.ReceivedSwapDetails]: "Received swap-details",
    [AtomicSwapStatus.SentSwapDetails]: "Sent swap-details",
    [AtomicSwapStatus.Audited]: "Audited",
};

interface StatusResponse {
    order_id: string;
    status: AtomicSwapStatus;
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

export async function _connectToAtom(web3: Web3, ingressURL: string, address: string): Promise<AtomicConnectionStatus> {

    const challenge = "cha";

    let response: WhoamiResponse;
    try {
        response = (await axios.get(`${API}/whoami/${challenge}`)).data;
    } catch (error) {
        return AtomicConnectionStatus.NotConnected;
    }

    if (response === undefined || response.whoAmI === undefined || response.whoAmI.authorizedAddresses === undefined) {
        return AtomicConnectionStatus.NotConnected;
    }

    const authorizedAddresses = response.whoAmI.authorizedAddresses.map(addr => addr.toLowerCase());
    if (authorizedAddresses.indexOf(address.toLowerCase()) === -1) {
        // TODO: Inform user address is not authorized
        return AtomicConnectionStatus.NotAuthorized;
    }

    // TODO: Use web3 from store
    const msg = "0x" + new Buffer(JSON.stringify(response.whoAmI)).toString("hex");
    const chaHash = web3.utils.keccak256(msg);
    const swapperAddress = web3.eth.accounts.recover(chaHash, "0x" + response.signature, true as any);

    // Check with Ingress if Atomic address is authorised
    // FIXME: Figure out why this breaks everything
    // const atomAuthorized = await checkAtomAuthorization(ingressURL, address);
    const atomAuthorized = false;
    if (atomAuthorized) {
        return AtomicConnectionStatus.ConnectedUnlocked;
    }

    return AtomicConnectionStatus.AtomNotAuthorized;
}

export async function submitOrderToAtom(orderID: EncodedData): Promise<void> {

    // orderID and signature should be hex-encoded
    const data: OrdersParameters = {
        orderID: orderID.toHex(),
    };

    let response: OrdersResponse;
    try {
        response = (await axios.post(`${API}/orders`, data)).data;
    } catch (error) {
        console.error(error);
        throw new Error("ErrorUnableToOpen");
    }

    if (response.orderID !== data.orderID) {
        console.error("Invalid order ID returned by Atom");
        throw new Error("ErrorUnableToOpen");
    }

    // TODO: Check response.signature against Atom's address
}

export async function getOrderStatus(orderID: EncodedData): Promise<AtomicSwapStatus> {

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
