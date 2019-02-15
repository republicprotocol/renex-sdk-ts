import axios from "axios";

// tsc complains about importing NodeRSA normally
import * as NodeRSAType from "node-rsa";
const NodeRSA = require("node-rsa") as new () => NodeRSAType;

import Web3 from "web3";

import BN from "bn.js";
import { List, Map } from "immutable";

import * as shamir from "./shamir";

import { DarknodeRegistryContract } from "../contracts/bindings/darknode_registry";
import { OrderbookContract } from "../contracts/bindings/orderbook";
import { errors, responseError, updateError } from "../errors";
import { OrderID, OrderInputsAll, OrderSettlement as RenExOrderSettlement, OrderSide, OrderStatus, OrderType as RenExOrderType, SimpleConsole, TokenCode } from "../types";
import { adjustDecimals } from "./balances";
import { EncodedData, Encodings } from "./encodedData";
import { MarketPairs } from "./market";
import { orderbookStateToOrderStatus, priceToCoExp, volumeToCoExp } from "./order";
import { Record } from "./record";
import { generateTokenPairing, splitTokenPairing, tokenToID } from "./tokens";

// TODO: Read these from the contract
const PRICE_OFFSET = 12;
const VOLUME_OFFSET = 12;
const NULL = "0x0000000000000000000000000000000000000000";

export enum OrderSettlement {
    RenEx = 1,
    RenExAtomic = 3,
}

function orderSettlementMapper(settlement: RenExOrderSettlement) {
    switch (settlement) {
        case RenExOrderSettlement.RenEx:
            return OrderSettlement.RenEx;
        case RenExOrderSettlement.RenExAtomic:
            return OrderSettlement.RenExAtomic;
    }
}

export enum OrderType {
    MIDPOINT = 0, // FIXME: Unsupported
    LIMIT = 1,
    MIDPOINT_IOC = 2, // FIXME: Unsupported
    LIMIT_IOC = 3,
}

function orderTypeMapper(orderType: RenExOrderType) {
    switch (orderType) {
        case RenExOrderType.MIDPOINT:
            return OrderType.MIDPOINT;
        case RenExOrderType.LIMIT:
            return OrderType.LIMIT;
        case RenExOrderType.MIDPOINT_IOC:
            return OrderType.MIDPOINT_IOC;
        case RenExOrderType.LIMIT_IOC:
            return OrderType.LIMIT_IOC;
    }
}

export enum OrderParity {
    BUY = 0,
    SELL = 1,
}

function orderParityMapper(orderSide: OrderSide) {
    switch (orderSide) {
        case OrderSide.BUY:
            return OrderParity.BUY;
        case OrderSide.SELL:
            return OrderParity.SELL;
        default:
            throw new Error(`Unknown order side: ${orderSide}`);
    }
}

export class Tuple extends Record({
    c: 0,
    q: 0,
}) { }

export class Order extends Record({
    signature: "",
    id: "",
    type: OrderType.LIMIT,
    parity: OrderParity.BUY,
    orderSettlement: OrderSettlement.RenEx,
    expiry: 0,
    tokens: new BN(0),
    price: new BN(0),
    volume: new BN(0),
    minimumVolume: new BN(0),
    nonce: new BN(0),
}) { }

export class SwapperdAuthorizationRequest extends Record({
    address: "",
    signature: "",
}) { }

export class OpenOrderRequest extends Record({
    address: "",
    orderFragmentMappings: Array<Map<string, List<OrderFragment>>>()
}) { }

export class WithdrawRequest extends Record({
    address: "",
    tokenID: 0,
}) { }

export class OrderFragment extends Record({
    id: "",
    orderId: "",
    orderType: OrderType.LIMIT,
    orderParity: OrderParity.BUY,
    orderSettlement: OrderSettlement.RenEx,
    orderExpiry: 0,
    tokens: "",
    price: ["", ""],
    volume: ["", ""],
    minimumVolume: ["", ""],
    nonce: "",
    index: 0,
}) { }

export class Pod extends Record({
    id: "",
    darknodes: List<string>(),
    orderFragments: List<OrderFragment>(),
}) { }

export function randomNonce(randomBN: () => BN): BN {
    let nonce = randomBN();
    while (nonce.gte(shamir.PRIME)) {
        nonce = randomBN();
    }
    return nonce;
}

export async function authorizeSwapper(ingressURL: string, request: SwapperdAuthorizationRequest): Promise<boolean> {
    try {
        const resp = await axios.post(`${ingressURL}/authorize`, request.toJS());
        if (resp.status === 201) {
            return true;
        }
        throw responseError(errors.CouldNotAuthorizeSwapper, resp);
    } catch (error) {
        if (error && error.response) {
            if (error.response.status === 401) {
                throw updateError(`Could not authorize swapper. Address is not KYC'd. ${error.message || error}`, error);
            }
            throw updateError(`Could not authorize swapper. ${error.message || error}`, error);
        }
        throw error;
    }
}

export async function _authorizeSwapperd(web3: Web3, ingressURL: string, swapperdAddress: string, address: string): Promise<void> {
    const req = await getSwapperdAuthorizationRequest(web3, swapperdAddress, address);
    await authorizeSwapper(ingressURL, req);
}

async function getSwapperdAuthorizationRequest(web3: Web3, swapperdAddress: string, address: string): Promise<SwapperdAuthorizationRequest> {
    const checksumAddress = web3.utils.toChecksumAddress(swapperdAddress);
    const dataForSigning: string = web3.utils.toHex(`RenEx: authorize: ${checksumAddress}`);

    let signature: EncodedData;
    try {
        // tslint:disable-next-line:no-any
        signature = new EncodedData(await (web3.eth.personal.sign as any)(dataForSigning, address));
    } catch (error) {
        if (error.message.match(/User denied message signature/)) {
            return Promise.reject(updateError(errors.SignatureCanceledByUser, error));
        }
        return Promise.reject(updateError(`${errors.UnsignedTransaction}: ${error.message || error}`, error));
    }

    const buff = signature.toBuffer();
    // Normalize v to be 0 or 1 (NOTE: Orderbook contract expects either format,
    // but for future compatibility, we stick to one format)
    // MetaMask gives v as 27 or 28, Ledger gives v as 0 or 1
    if (buff[64] === 27 || buff[64] === 28) {
        buff[64] = buff[64] - 27;
    }

    return new SwapperdAuthorizationRequest({ address: checksumAddress, signature: buff.toString("base64") });
}

// export async function checkSwapperdAuthorization(
//     ingressURL: string,
//     address: string,
//     expectedEthAddress: string,
// ): Promise<boolean> {
//     return axios.get(`${ingressURL}/authorized/${address}`)
//         .then(resp => {
//             if (resp.status !== 200) {
//                 throw new Error("Unexpected status code: " + resp.status);
//             }
//             const approvedAddress = new EncodedData(resp.data.atomAddress, Encodings.HEX).toHex();
//             return approvedAddress.toLowerCase() === expectedEthAddress.toLowerCase();
//         })
//         .catch(err => {
//             console.error(err);
//             return false;
//         });
// }

export function createOrder(orderInputs: OrderInputsAll, nonce?: BN): Order {
    const marketDetail = MarketPairs.get(orderInputs.symbol);
    if (!marketDetail) {
        throw new Error(`Couldn't find market information for market: ${orderInputs.symbol}`);
    }
    const baseToken = marketDetail.base;
    const quoteToken = marketDetail.quote;
    const spendToken = orderInputs.side === OrderSide.BUY ? quoteToken : baseToken;
    const receiveToken = orderInputs.side === OrderSide.BUY ? baseToken : quoteToken;

    const price = adjustDecimals(orderInputs.price, 0, PRICE_OFFSET);
    const volume = adjustDecimals(orderInputs.volume, 0, VOLUME_OFFSET);
    const minimumVolume = adjustDecimals(orderInputs.minVolume, 0, VOLUME_OFFSET);

    const tokens = orderInputs.side === OrderSide.BUY ?
        generateTokenPairing(tokenToID(spendToken), tokenToID(receiveToken)) :
        generateTokenPairing(tokenToID(receiveToken), tokenToID(spendToken));

    const ingressOrder = new Order({
        type: orderTypeMapper(orderInputs.type),
        orderSettlement: orderSettlementMapper(marketDetail.orderSettlement),
        nonce: nonce ? nonce : new BN(0),

        parity: orderParityMapper(orderInputs.side),
        tokens,
        price,
        volume,
        minimumVolume,
    });
    return ingressOrder;
}

export async function submitOrderFragments(
    ingressURL: string,
    request: OpenOrderRequest,
): Promise<EncodedData> {
    try {
        const resp = await axios.post(`${ingressURL}/orders`, request.toJS());
        if (resp.status !== 201) {
            throw responseError("Unexpected status code returned by Ingress", resp);
        }
        return new EncodedData(resp.data.signature, Encodings.BASE64);
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                throw updateError("KYC verification failed in Ingress", error);
                error.message = "KYC verification failed in Ingress";
                throw error;
            } else {
                throw new Error(`Ingress returned status ${error.response.status} with reason: ${error.response.data}`);
            }
        } else {
            throw error;
        }
    }
}

export async function requestWithdrawalSignature(ingressURL: string, address: string, token: TokenCode): Promise<EncodedData> {
    const request = new WithdrawRequest({
        address: address.slice(2),
        tokenID: tokenToID(token),
    });

    const resp = await axios.post(`${ingressURL}/withdrawals`, request.toJS());
    if (resp.status !== 201) {
        throw new Error("Unexpected status code: " + resp.status);
    }

    return new EncodedData(resp.data.signature, Encodings.BASE64);
}

async function ordersBatch(web3: Web3, orderbook: OrderbookContract, offset: number, limit: number): Promise<List<[OrderID, OrderStatus, string]>> {
    let orders;
    try {
        orders = await orderbook.getOrders(web3.utils.toHex(offset), web3.utils.toHex(limit));
    } catch (error) {
        console.error(`Failed to get call getOrders in ordersBatch`);
        throw error;
    }
    const orderIDs = orders[0];
    const tradersAddresses = orders[1];
    const orderStatuses = orders[2];

    let ordersList = List<[OrderID, OrderStatus, string]>();
    for (let i = 0; i < orderIDs.length; i++) {
        const status = orderbookStateToOrderStatus(new BN(orderStatuses[i]).toNumber());
        ordersList = ordersList.push([orderIDs[i], status, tradersAddresses[i]]);
    }
    return ordersList;
}

export async function getOrders(web3: Web3, orderbook: OrderbookContract, startIn?: number, limitIn?: number): Promise<List<[OrderID, OrderStatus, string]>> {
    let orderCount;
    try {
        orderCount = new BN(await orderbook.ordersCount()).toNumber();
    } catch (error) {
        console.error(`Failed to call orderCount in getOrders`);
        throw error;
    }

    // If limit is 0 then we treat is as no limit
    const limit = limitIn || orderCount - (startIn || 0);

    // Start can be 0 so we compare against undefined instead
    let start = startIn !== undefined ? startIn : Math.max(0, orderCount - limit);

    // We only get at most 500 orders per batch
    let batchLimit = Math.min(limit, 500);

    // Indicates where to stop (non-inclusive)
    const stop = limit ? start + Math.min(orderCount, limit) : orderCount;

    let ordersList = List<[OrderID, OrderStatus, string]>();
    while (true) {
        // Check if the limit has been reached
        if (start >= stop) {
            return ordersList;
        }

        // Don't get more than required
        batchLimit = Math.min(batchLimit, stop - start);

        // Retrieve batch of orders and increment start
        const batch = await ordersBatch(web3, orderbook, start, batchLimit);
        ordersList = ordersList.concat(batch).toList();
        start += batchLimit;
    }
}

// export async function getOrder(wallet: Wallet, orderId: string): Promise<Order> {
//     // FIXME: Unimplemented
//     return Promise.resolve(new Order({}));
// }

// export async function getOrders(wallet: Wallet, order: Order): Promise<List<Order>> {
//     // FIXME: Unimplemented
//     return Promise.resolve(List<Order>());
// }

export function getOrderID(web3: Web3, order: Order): EncodedData {
    const [leftToken, rightToken] = splitTokenPairing(order.tokens);
    const adjustedTokens = order.parity === OrderParity.BUY ? order.tokens : generateTokenPairing(rightToken, leftToken);

    const bytes = Buffer.concat([
        // Prefix hash
        new BN(order.type).toArrayLike(Buffer, "be", 1),
        new BN(order.expiry).toArrayLike(Buffer, "be", 8),
        order.nonce.toArrayLike(Buffer, "be", 8),
        new BN(order.orderSettlement).toArrayLike(Buffer, "be", 8),
        adjustedTokens.toArrayLike(Buffer, "be", 8),
        new BN(order.price).toArrayLike(Buffer, "be", 32),
        new BN(order.volume).toArrayLike(Buffer, "be", 32),
        new BN(order.minimumVolume).toArrayLike(Buffer, "be", 32),
    ]);
    return new EncodedData(web3.utils.keccak256(`0x${bytes.toString("hex")}`), Encodings.HEX);
}

export async function buildOrderMapping(
    web3: Web3, darknodeRegistryContract: DarknodeRegistryContract, order: Order, simpleConsole: SimpleConsole,
): Promise<Map<string, List<OrderFragment>>> {
    const pods = await getPods(web3, darknodeRegistryContract, simpleConsole);

    const priceCoExp = priceToCoExp(order.price);
    const volumeCoExp = volumeToCoExp(order.volume);
    const minVolumeCoExp = volumeToCoExp(order.minimumVolume);

    const fragmentPromises = (pods)
        .map(async (pod: Pod): Promise<Pod> => {
            const n = pod.darknodes.size;
            const k = Math.floor((2 * (n + 1)) / 3);

            simpleConsole.log(`Splitting secret shares for pod ${pod.id.slice(0, 8)}...`);
            const tokenShares = shamir.split(n, k, new BN(order.tokens));
            const priceCoShares = shamir.split(n, k, new BN(priceCoExp.co));
            const priceExpShares = shamir.split(n, k, new BN(priceCoExp.exp));
            const volumeCoShares = shamir.split(n, k, new BN(volumeCoExp.co));
            const volumeExpShares = shamir.split(n, k, new BN(volumeCoExp.exp));
            const minimumVolumeCoShares = shamir.split(n, k, new BN(minVolumeCoExp.co));
            const minimumVolumeExpShares = shamir.split(n, k, new BN(minVolumeCoExp.exp));
            const nonceShares = shamir.split(n, k, order.nonce);

            let orderFragments = List<OrderFragment>();

            // Loop through each darknode in the pod
            for (let i = 0; i < n; i++) {
                const darknode = pod.darknodes.get(i, undefined);
                if (darknode === undefined) {
                    throw new Error("invalid darknode access");
                }
                simpleConsole.log(`Encrypting for darknode ${new EncodedData("0x1b14" + darknode.slice(2), Encodings.HEX).toBase58().slice(0, 8)}...`);

                // Retrieve darknode RSA public key from Darknode contract
                let darknodeKey = null;
                try {
                    darknodeKey = await getDarknodePublicKey(darknodeRegistryContract, darknode, simpleConsole);
                } catch (error) {
                    // We don't want everything to crash if even one darknode is malicious
                    // Log the error but keep going
                    console.error(error);
                }

                const [
                    tokenShare,
                    priceCoShare,
                    priceExpShare,
                    volumeCoShare,
                    volumeExpShare,
                    minimumVolumeCoShare,
                    minimumVolumeExpShare,
                    nonceShare
                ] = [
                        tokenShares.get(i),
                        priceCoShares.get(i),
                        priceExpShares.get(i),
                        volumeCoShares.get(i),
                        volumeExpShares.get(i),
                        minimumVolumeCoShares.get(i),
                        minimumVolumeExpShares.get(i),
                        nonceShares.get(i),
                    ];

                if (
                    tokenShare === undefined ||
                    priceCoShare === undefined ||
                    priceExpShare === undefined ||
                    volumeCoShare === undefined ||
                    volumeExpShare === undefined ||
                    minimumVolumeCoShare === undefined ||
                    minimumVolumeExpShare === undefined ||
                    nonceShare === undefined
                ) {
                    throw new Error("invalid share access");
                }

                let orderFragment = new OrderFragment({
                    orderId: order.id,
                    orderType: order.type,
                    orderParity: order.parity,
                    orderSettlement: order.orderSettlement,
                    tokens: encryptForDarknode(darknodeKey, tokenShare, 8).toBase64(),
                    price: [
                        encryptForDarknode(darknodeKey, priceCoShare, 8).toBase64(),
                        encryptForDarknode(darknodeKey, priceExpShare, 8).toBase64()
                    ],
                    volume: [
                        encryptForDarknode(darknodeKey, volumeCoShare, 8).toBase64(),
                        encryptForDarknode(darknodeKey, volumeExpShare, 8).toBase64()
                    ],
                    minimumVolume: [
                        encryptForDarknode(darknodeKey, minimumVolumeCoShare, 8).toBase64(),
                        encryptForDarknode(darknodeKey, minimumVolumeExpShare, 8).toBase64()
                    ],
                    nonce: encryptForDarknode(darknodeKey, nonceShare, 8).toBase64(),
                    index: i + 1,
                });
                orderFragment = orderFragment.set("id", hashOrderFragmentToId(web3, orderFragment));
                orderFragments = orderFragments.push(orderFragment);
            }
            return pod.set("orderFragments", orderFragments);
        });

    // Reduce must happen serially
    return fragmentPromises.reduce(
        async (fragmentMappingsPromise: Promise<Map<string, List<OrderFragment>>>, podPromise: Promise<Pod>) => {
            const fragmentMappings = await fragmentMappingsPromise;
            const pod = await podPromise;
            return fragmentMappings.set(pod.id, pod.orderFragments);
        },
        Promise.resolve(Map<string, List<OrderFragment>>())
    );
}

function hashOrderFragmentToId(web3: Web3, orderFragment: OrderFragment): string {
    // TODO: Fix order hashing
    return Buffer.from(web3.utils.keccak256(JSON.stringify(orderFragment)).slice(2), "hex").toString("base64");
}

async function getDarknodePublicKey(
    darknodeRegistryContract: DarknodeRegistryContract, darknode: string, simpleConsole: SimpleConsole,
): Promise<NodeRSAType | null> {
    const darknodeKeyHex: string | null = await darknodeRegistryContract.getDarknodePublicKey(darknode);

    if (darknodeKeyHex as (string | null) === null || darknodeKeyHex.length === 0) {
        simpleConsole.error(`Unable to retrieve public key for ${darknode}`);
        return null;
    }

    const darknodeKey = Buffer.from(darknodeKeyHex.slice(2), "hex");

    // We require the exponent E to fit into 32 bytes.
    // Since it is stored at 64 bytes, we ignore the first 32 bytes.
    // (Go's crypto/rsa Validate() also requires E to fit into a 32-bit integer)
    const e = darknodeKey.slice(0, 8).readUInt32BE(4);
    const n = darknodeKey.slice(8);

    const key = new NodeRSA();
    key.importKey({
        n,
        e,
    });

    key.setOptions({
        encryptionScheme: {
            scheme: "pkcs1_oaep",
            hash: "sha1"
        }
    });

    return key;
}

export function encryptForDarknode(darknodeKey: NodeRSAType | null, share: shamir.Share, byteCount: number): EncodedData {
    if (darknodeKey === null) {
        return new EncodedData("", Encodings.BASE64);
    }

    // TODO: Check that bignumber isn't bigger than 8 bytes (64 bits)
    // Serialize number to 8-byte array (64-bits) (big-endian)
    const indexBytes = new BN(share.index).toArrayLike(Buffer, "be", byteCount);
    const bignumberBytes = share.value.toArrayLike(Buffer, "be", byteCount);

    const bytes = Buffer.concat([indexBytes, bignumberBytes]);

    return new EncodedData(darknodeKey.encrypt(bytes, "buffer"), Encodings.BUFFER);
}

/*
 * Retrieve all the darknodes registered in the current epoch.
 * The getDarknodes() function will always return an array of {count} with empty
 * values being the NULL address. These addresses must be filtered out.
 * When the {start} value is not the NULL address, it is always returned as the
 * first entry so it should not be re-added to the list of all darknodes.
 */
async function getAllDarknodes(web3: Web3, darknodeRegistryContract: DarknodeRegistryContract): Promise<string[]> {
    const batchSize = web3.utils.toHex(10);

    const allDarknodes = [];
    let lastDarknode = NULL;
    do {
        const darknodes = await darknodeRegistryContract.getDarknodes(lastDarknode, batchSize);
        allDarknodes.push(...darknodes.filter(addr => addr !== NULL && addr !== lastDarknode));
        [lastDarknode] = darknodes.slice(-1);
    } while (lastDarknode !== NULL);

    return allDarknodes;
}

/*
 * Calculate pod arrangement based on current epoch
 */
async function getPods(web3: Web3, darknodeRegistryContract: DarknodeRegistryContract, simpleConsole: SimpleConsole): Promise<List<Pod>> {
    const darknodes = await getAllDarknodes(web3, darknodeRegistryContract);
    const minimumPodSize = new BN(await darknodeRegistryContract.minimumPodSize()).toNumber();
    simpleConsole.log(`Using minimum pod size ${minimumPodSize}`);
    const epoch = await darknodeRegistryContract.currentEpoch();

    if (!darknodes.length) {
        return Promise.reject(new Error("no darknodes in contract"));
    }

    if (minimumPodSize === 0) {
        return Promise.reject(new Error("invalid minimum pod size (0)"));
    }

    const epochVal = new BN(epoch[0]);
    const numberOfDarknodes = new BN(darknodes.length);
    let x = epochVal.mod(numberOfDarknodes);
    let positionInOcean = List();
    for (let i = 0; i < darknodes.length; i++) {
        positionInOcean = positionInOcean.set(i, -1);
    }

    simpleConsole.log(`Calculating pods`);

    let pods = List<Pod>();
    // FIXME: (setting to 1 if 0)
    const numberOfPods = Math.floor(darknodes.length / minimumPodSize) || 1;
    for (let i = 0; i < numberOfPods; i++) {
        pods = pods.push(new Pod());
    }

    for (let i = 0; i < darknodes.length; i++) {
        while (positionInOcean.get(x.toNumber()) !== -1) {
            x = x.add(new BN(1));
            x = x.mod(numberOfDarknodes);
        }

        positionInOcean = positionInOcean.set(x.toNumber(), i);
        const podIndex = i % numberOfPods;

        const pod = new Pod({
            darknodes: pods.get(podIndex, new Pod()).darknodes.push(darknodes[x.toNumber()])
        });
        pods = pods.set(podIndex, pod);

        x = x.add(epochVal);
        x = x.mod(numberOfDarknodes);
    }

    for (let i = 0; i < pods.size; i++) {
        let hashData = List<Buffer>();
        for (const darknode of pods.get(i, new Pod()).darknodes.toArray()) {
            hashData = hashData.push(Buffer.from(darknode.substring(2), "hex"));
        }

        const id = new EncodedData(web3.utils.keccak256(`0x${Buffer.concat(hashData.toArray()).toString("hex")}`), Encodings.HEX);
        const pod = new Pod({
            id: id.toBase64(),
            darknodes: pods.get(i, new Pod()).darknodes
        });

        // console.log(pod.id, JSON.stringify(pod.darknodes.map((node: string) =>
        //     new EncodedData("0x1B20" + node.slice(2), Encodings.HEX).toBase58()
        // ).toArray()));

        pods = pods.set(i, pod);
    }

    return pods;
}
