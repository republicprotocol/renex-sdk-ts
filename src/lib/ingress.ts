import axios from "axios";

// tsc complains about importing NodeRSA normally
import * as NodeRSAType from "node-rsa";
const NodeRSA = require("node-rsa") as { new(...args: any[]): NodeRSAType };

import Web3 from "web3";

import { BN } from "bn.js";
import { List, Map } from "immutable";

import * as shamir from "./shamir";

import { DarknodeRegistryContract } from "../contracts/bindings/darknode_registry";
import { OrderbookContract } from "../contracts/bindings/orderbook";
import { OrderID, OrderStatus } from "../index";
import { EncodedData, Encodings } from "./encodedData";
import { ErrCanceledByUser, ErrInvalidOrderDetails, ErrUnsignedTransaction } from "./errors";
import { OrderSettlement } from "./market";
import { NetworkData } from "./network";
import { orderbookStateToOrderStatus, priceToCoExp, volumeToCoExp } from "./order";
import { Record } from "./record";

const NULL = "0x0000000000000000000000000000000000000000";

export enum OrderType {
    MIDPOINT = 0,
    LIMIT = 1, // FIXME: unsupported
}

export enum OrderParity {
    BUY = 0,
    SELL = 1,
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
    expiry: Math.round((new Date()).getTime() / 1000),
    tokens: new BN(0),
    price: new BN(0),
    volume: new BN(0),
    minimumVolume: new BN(0),
    nonce: new BN(0),
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
    orderExpiry: Math.round((new Date()).getTime() / 1000),
    tokens: "",
    price: ["", ""],
    volume: ["", ""],
    minimumVolume: ["", ""],
    nonce: "",
    index: 0,
}) { }

export class Pool extends Record({
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

export async function openOrder(web3: Web3, address: string, order: Order): Promise<Order> {
    // Verify order details
    if (!verifyOrder(order)) {
        return Promise.reject(new Error(ErrInvalidOrderDetails));
    }

    const id: EncodedData = new EncodedData(getOrderID(web3, order), Encodings.HEX);
    const prefix: string = web3.utils.toHex("Republic Protocol: open: ");
    const hashForSigning: string = (prefix + id.toHex(""));

    let signature: EncodedData;
    try {
        signature = new EncodedData(await web3.eth.sign(hashForSigning, address));
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

    order = order.merge({ id: id.toBase64(), signature: buff.toString("base64") });

    return order;
}

function verifyOrder(order: Order) {
    // FIXME: check order price and volume correctness
    return true;
}

export async function submitOrderFragments(
    request: OpenOrderRequest,
): Promise<EncodedData> {
    try {
        const resp = await axios.post(`${NetworkData.ingress}/orders`, request.toJS());
        if (resp.status !== 201) {
            throw new Error("Unexpected status code: " + resp.status);
        }
        return new EncodedData(resp.data.signature, Encodings.BASE64);
    } catch (error) {
        return Promise.reject(error);
    }
}

export async function requestWithdrawalSignature(address: string, tokenID: number): Promise<EncodedData> {
    const request = new WithdrawRequest({
        address: address.slice(2),
        tokenID,
    });

    const resp = await axios.post(`${NetworkData.ingress}/withdrawals`, request.toJS());
    if (resp.status !== 201) {
        throw new Error("Unexpected status code: " + resp.status);
    }

    return new EncodedData(resp.data.signature, Encodings.BASE64);
}

async function ordersBatch(orderbook: OrderbookContract, offset: number, limit: number): Promise<List<[OrderID, OrderStatus, string]>> {
    const orders = await orderbook.getOrders(offset, limit);
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

export async function listOrders(orderbook: OrderbookContract, startIn?: number, limitIn?: number): Promise<List<[OrderID, OrderStatus, string]>> {
    const orderCount = new BN(await orderbook.ordersCount()).toNumber();

    // If limit is 0 then we treat is as no limit
    const limit = limitIn || orderCount - (startIn || 0);

    // Start can be 0 so we compare against undefined instead
    let start = startIn !== undefined ? startIn : orderCount - limit;

    // We only get at most 500 orders per batch
    let batchLimit = Math.min(limit, 500);

    // Indicates where to stop (non-inclusive)
    const stop = limit ? start + limit : orderCount;

    let ordersList = List<[OrderID, OrderStatus, string]>();
    while (true) {
        // Check if the limit has been reached
        if (start >= stop) {
            return ordersList;
        }

        // Don't get more than required
        batchLimit = Math.min(batchLimit, stop - start);

        // Retrieve batch of orders and increment start
        const batch = await ordersBatch(orderbook, start, batchLimit);
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
    const bytes = Buffer.concat([
        // Prefix hash
        new BN(order.type).toArrayLike(Buffer, "be", 1),
        new BN(order.expiry).toArrayLike(Buffer, "be", 8),
        order.nonce.toArrayLike(Buffer, "be", 8),

        new BN(order.orderSettlement).toArrayLike(Buffer, "be", 8),
        (
            order.parity === OrderParity.BUY ?
                new BN(order.tokens).toArrayLike(Buffer, "be", 8)
                :
                new BN(order.tokens).shln(32).or(new BN(order.tokens).shrn(32)).toArrayLike(Buffer, "be", 8)
        ),
        new BN(order.price).toArrayLike(Buffer, "be", 32),
        new BN(order.volume).toArrayLike(Buffer, "be", 32),
        new BN(order.minimumVolume).toArrayLike(Buffer, "be", 32),
    ]);
    return new EncodedData(web3.utils.keccak256(`0x${bytes.toString("hex")}`), Encodings.HEX);
}

export async function buildOrderMapping(
    web3: Web3, darknodeRegistryContract: DarknodeRegistryContract, order: Order
): Promise<Map<string, List<OrderFragment>>> {
    const pods = await getPods(web3, darknodeRegistryContract);

    const fragmentPromises = (pods)
        .map(async (pool: Pool): Promise<Pool> => {
            const n = pool.darknodes.size;
            const k = Math.floor((2 * (n + 1)) / 3);

            const priceCoExp = priceToCoExp(order.price);
            const volumeCoExp = volumeToCoExp(order.volume);
            const minVolumeCoExp = volumeToCoExp(order.minimumVolume);
            const tokenShares = shamir.split(n, k, new BN(order.tokens));
            const priceCoShares = shamir.split(n, k, new BN(priceCoExp.co));
            const priceExpShares = shamir.split(n, k, new BN(priceCoExp.exp));
            const volumeCoShares = shamir.split(n, k, new BN(volumeCoExp.co));
            const volumeExpShares = shamir.split(n, k, new BN(volumeCoExp.exp));
            const minimumVolumeCoShares = shamir.split(n, k, new BN(minVolumeCoExp.co));
            const minimumVolumeExpShares = shamir.split(n, k, new BN(minVolumeCoExp.exp));
            const nonceShares = shamir.split(n, k, order.nonce);

            let orderFragments = List<OrderFragment>();

            // Loop through each darknode in the pool
            for (let i = 0; i < n; i++) {
                const darknode = pool.darknodes.get(i);
                console.log(`Encrypting for darknode ${new EncodedData("0x1b14" + darknode.slice(2), Encodings.HEX).toBase58()}...`);

                // Retrieve darknode RSA public key from Darknode contract
                const darknodeKey = await getDarknodePublicKey(darknodeRegistryContract, darknode);

                let orderFragment = new OrderFragment({
                    orderId: order.id,
                    orderType: order.type,
                    orderParity: order.parity,
                    orderSettlement: order.orderSettlement,
                    orderExpiry: order.expiry,
                    tokens: encryptForDarknode(darknodeKey, tokenShares.get(i), 8).toBase64(),
                    price: [
                        encryptForDarknode(darknodeKey, priceCoShares.get(i), 8).toBase64(),
                        encryptForDarknode(darknodeKey, priceExpShares.get(i), 8).toBase64()
                    ],
                    volume: [
                        encryptForDarknode(darknodeKey, volumeCoShares.get(i), 8).toBase64(),
                        encryptForDarknode(darknodeKey, volumeExpShares.get(i), 8).toBase64()
                    ],
                    minimumVolume: [
                        encryptForDarknode(darknodeKey, minimumVolumeCoShares.get(i), 8).toBase64(),
                        encryptForDarknode(darknodeKey, minimumVolumeExpShares.get(i), 8).toBase64()
                    ],
                    nonce: encryptForDarknode(darknodeKey, nonceShares.get(i), 8).toBase64(),
                    index: i + 1,
                });
                orderFragment = orderFragment.set("id", hashOrderFragmentToId(web3, orderFragment));
                orderFragments = orderFragments.push(orderFragment);
            }
            return pool.set("orderFragments", orderFragments);
        });

    // Reduce must happen serially
    return fragmentPromises.reduce(
        async (poolsPromise: Promise<Map<string, List<OrderFragment>>>, poolPromise: Promise<Pool>) => {
            const pools = await poolsPromise;
            const pool = await poolPromise;
            return pools.set(pool.id, pool.orderFragments);
        },
        Promise.resolve(Map<string, List<OrderFragment>>())
    );
}

function hashOrderFragmentToId(web3: Web3, orderFragment: OrderFragment): string {
    // TODO: Fix order hashing
    return Buffer.from(web3.utils.keccak256(JSON.stringify(orderFragment)).slice(2), "hex").toString("base64");
}

async function getDarknodePublicKey(
    darknodeRegistryContract: DarknodeRegistryContract, darknode: string
): Promise<NodeRSAType | null> {
    const darknodeKeyHex = await darknodeRegistryContract.getDarknodePublicKey(darknode);

    if (darknodeKeyHex === null || darknodeKeyHex.length === 0) {
        console.error(`Unable to retrieve public key for ${darknode}`);
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
 * Retreive all the darknodes in the darknode registry contract.
 * The getDarknodes() function will always return an array of {count} with empty
 * values being the NULL address. These addresses must be filtered out.
 * When the {start} value is not the NULL address, it is always returned as the
 * first entry so it should not be re-added to the list of all darknodes.
 */
async function getAllDarknodes(darknodeRegistryContract: DarknodeRegistryContract): Promise<string[]> {
    const batchSize = 10;

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
async function getPods(web3: Web3, darknodeRegistryContract: DarknodeRegistryContract): Promise<List<Pool>> {
    const darknodes = await getAllDarknodes(darknodeRegistryContract);
    const minimumPodSize = new BN(await darknodeRegistryContract.minimumPodSize()).toNumber();
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

    let pools = List<Pool>();
    // FIXME: (setting to 1 if 0)
    const numberOfPods = Math.floor(darknodes.length / minimumPodSize) || 1;
    for (let i = 0; i < numberOfPods; i++) {
        pools = pools.push(new Pool());
    }

    for (let i = 0; i < darknodes.length; i++) {
        let isRegistered = await darknodeRegistryContract.isRegistered(darknodes[x.toNumber()]);
        while (!isRegistered || positionInOcean.get(x.toNumber()) !== -1) {
            x = x.add(new BN(1));
            x = x.mod(numberOfDarknodes);
            isRegistered = await darknodeRegistryContract.isRegistered(darknodes[x.toNumber()]);
        }

        positionInOcean = positionInOcean.set(x.toNumber(), i);
        const poolIndex = i % numberOfPods;

        const pool = new Pool({
            darknodes: pools.get(poolIndex).darknodes.push(darknodes[x.toNumber()])
        });
        pools = pools.set(poolIndex, pool);

        x = x.add(epochVal);
        x = x.mod(numberOfDarknodes);
    }

    for (let i = 0; i < pools.size; i++) {
        let hashData = List<Buffer>();
        for (const darknode of pools.get(i).darknodes.toArray()) {
            hashData = hashData.push(Buffer.from(darknode.substring(2), "hex"));
        }

        const id = new EncodedData(web3.utils.keccak256(`0x${Buffer.concat(hashData.toArray()).toString("hex")}`), Encodings.HEX);
        const pool = new Pool({
            id: id.toBase64(),
            darknodes: pools.get(i).darknodes
        });

        console.log(pool.id, JSON.stringify(pool.darknodes.map((node: string) =>
            new EncodedData("0x1B20" + node.slice(2), Encodings.HEX).toBase58()
        ).toArray()));

        pools = pools.set(i, pool);
    }

    return pools;
}
