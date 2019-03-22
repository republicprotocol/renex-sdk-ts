// tsc complains about importing NodeRSA normally
import * as NodeRSAType from "node-rsa";
const NodeRSA = require("node-rsa") as new () => NodeRSAType;

import axios, { AxiosRequestConfig } from "axios";
import BN from "bn.js";
import Web3 from "web3";
import Contract from "web3/eth/contract";

import { BigNumber } from "bignumber.js";
import { List, Map } from "immutable";

import * as shamir from "./shamir";

import { responseError, updateError } from "../errors";
import { SimpleConsole } from "../types";
import { EncodedData, Encodings } from "./encodedData";
import { Record } from "./record";

// TODO: Read these from the contract
// const PRICE_OFFSET = 12;
// const VOLUME_OFFSET = 12;
const NULL = "0x0000000000000000000000000000000000000000";

export class SwapperDAuthorizationRequest extends Record({
    address: "",
    signature: "",
}) { }

export class PodShares extends Record({
    price: List<string>(),
    volume: List<string>(),
    minimumFill: List<string>(),
}) { }
export class OpenOrderRequest extends Record({
    orderID: "",
    sendToken: "",
    receiveToken: "",
    encryptedShares: Map<string, PodShares>(),
}) { }

export class Pod extends Record({
    id: "",
    darknodes: List<string>(),
}) { }

export function randomNonce(): BN {
    const nonce = new BigNumber(Math.random()).multipliedBy(new BigNumber(shamir.PRIME.toString()));
    return new BN(nonce.toFixed());
}

const authConfig = (token: string): AxiosRequestConfig => {
    return {
        withCredentials: true,
        headers: {
            Authorization: `Bearer ${token}`,
        }
    };
};

export interface NewOrder {
    marketID: string;
    price: BN;
    volume: BN;
    minimumFill: BN;
}

export async function submitOrderFragments(
    renexNode: string,
    request: OpenOrderRequest,
    token: string,
): Promise<void> {
    try {
        const resp = await axios.post(`${renexNode}/order`, request.toJS(), authConfig(token));
        if (resp.status !== 200) {
            throw responseError("Unexpected status code returned by RenEx node", resp);
        }
        return;
        // return new EncodedData(resp.data.signature, Encodings.BASE64);
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                throw updateError("Authentication failed in RenEx node", error);
            } else {
                throw new Error(`RenEx node returned status ${error.response.status} with reason: ${error.response.data}`);
            }
        } else {
            throw error;
        }
    }
}

export async function cancelOrder(
    renexNode: string,
    orderID: string,
    token: string,
): Promise<void> {
    try {
        const resp = await axios.delete(`${renexNode}/order?id=${orderID}`, authConfig(token));
        if (resp.status !== 200) {
            throw responseError("Unexpected status code returned by RenEx node", resp);
        }
        return;
        // return new EncodedData(resp.data.signature, Encodings.BASE64);
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401) {
                throw updateError("Authentication failed in RenEx node", error);
            } else {
                throw new Error(`RenEx node returned status ${error.response.status} with reason: ${error.response.data}`);
            }
        } else {
            throw error;
        }
    }
}

const promiseAll = async <a>(list: List<Promise<a>>, defaultValue: a): Promise<List<a>> => {
    let newList = List<a>();
    for (const entryP of list) {
        try {
            newList = newList.push(await entryP);
        } catch (error) {
            newList = newList.push(defaultValue);
        }
    }
    return newList;
};

export async function buildOrderMapping(
    web3: Web3,
    renexNode: string,
    darknodeRegistryContract: Contract,
    order: NewOrder,
    simpleConsole: SimpleConsole,
): Promise<Map<string, PodShares>> {
    const marketID = order.marketID;
    const pods = await getPods(web3, renexNode, darknodeRegistryContract, simpleConsole, marketID);

    const fragmentPromises = (pods)
        .map(async (pod: Pod): Promise<[string, PodShares]> => {
            const n = pod.darknodes.size;
            const k = Math.floor(((n * 2) / 3 + 1) / 2) - 1;

            simpleConsole.log(`Splitting secret shares for pod ${pod.id.slice(0, 8)}...`);
            const priceShares = shamir.split(n, k, order.price);
            const volumeShares = shamir.split(n, k, order.volume);
            const minimumFillShares = shamir.split(n, k, order.minimumFill);

            const darknodeKeys = pod.darknodes.map(async (darknode) => await getDarknodePublicKey(darknodeRegistryContract, darknode, simpleConsole));

            const transform = (shares: List<shamir.Share>) => promiseAll(
                shares
                    .zip(darknodeKeys)
                    // .map(encryptForDarknode)
                    .map(shareToEncodedData)
                    .map(async data => (await data).toBase64())
                ,
                ""
            );

            const podShares = new PodShares({
                price: await transform(priceShares),
                volume: await transform(volumeShares),
                minimumFill: await transform(minimumFillShares),
            });

            return [pod.id, podShares];

            // // Loop through each darknode in the pod
            // for (let i = 0; i < n; i++) {
            //     const darknode = pod.darknodes.get(i, undefined);
            //     if (darknode === undefined) {
            //         throw new Error("invalid darknode access");
            //     }
            //     simpleConsole.log(`Encrypting for darknode ${new EncodedData("0x1b14" + darknode.slice(2), Encodings.HEX).toBase58().slice(0, 8)}...`);

            // }

            //     // Retrieve darknode RSA public key from Darknode contract
            //     // let darknodeKey = null;
            //     // try {
            //     //     darknodeKey = await getDarknodePublicKey(darknodeRegistryContract, darknode, simpleConsole);
            //     // } catch (error) {
            //     //     // We don't want everything to crash if even one darknode is malicious
            //     //     // Log the error but keep going
            //     //     console.error(error);
            //     // }

            //     const [
            //         priceShare,
            //         volumeShare,
            //         minimumFillShare,
            //     ] = [
            //             priceShares.get(i),
            //             volumeShares.get(i),
            //             minimumFillShares.get(i),
            //         ];

            //     if (
            //         priceShare === undefined ||
            //         volumeShare === undefined ||
            //         minimumFillShare === undefined
            //     ) {
            //         throw new Error("invalid share access");
            //     }

            //     // let orderFragment = new OrderFragment({
            //     //     orderId: order.id,
            //     //     orderSettlement: order.orderSettlement,
            //     //     tokens: encryptForDarknode(darknodeKey, tokenShare, 8).toBase64(),
            //     //     price: [
            //     //         encryptForDarknode(darknodeKey, priceCoShare, 8).toBase64(),
            //     //         encryptForDarknode(darknodeKey, priceExpShare, 8).toBase64()
            //     //     ],
            //     //     volume: [
            //     //         encryptForDarknode(darknodeKey, volumeCoShare, 8).toBase64(),
            //     //         encryptForDarknode(darknodeKey, volumeExpShare, 8).toBase64()
            //     //     ],
            //     //     minimumFill: [
            //     //         encryptForDarknode(darknodeKey, minimumFillCoShare, 8).toBase64(),
            //     //         encryptForDarknode(darknodeKey, minimumFillExpShare, 8).toBase64()
            //     //     ],
            //     //     nonce: encryptForDarknode(darknodeKey, nonceShare, 8).toBase64(),
            //     //     index: i + 1,
            //     // });
            //     // orderFragment = orderFragment.set("id", hashOrderFragmentToId(web3, orderFragment));
            //     // orderFragments = orderFragments.push(orderFragment);
            // }
        });

    // Reduce must happen serially
    return fragmentPromises.reduce(
        async (fragmentMappingsPromise: Promise<Map<string, PodShares>>, podPromise: Promise<[string, PodShares]>) => {
            const fragmentMappings = await fragmentMappingsPromise;
            try {
                const [podID, podShares] = await podPromise;
                return fragmentMappings.set(podID, podShares);
            } catch (error) {
                console.error(error);
                return fragmentMappings;
            }
        },
        Promise.resolve(Map<string, PodShares>())
    );
}

// function hashOrderFragmentToId(web3: Web3, orderFragment: OrderFragment): string {
//     // TODO: Fix order hashing
//     return Buffer.from(web3.utils.keccak256(JSON.stringify(orderFragment)).slice(2), "hex").toString("base64");
// }

async function getDarknodePublicKey(
    darknodeRegistryContract: Contract, darknode: string, simpleConsole: SimpleConsole,
): Promise<NodeRSAType | null> {
    const darknodeKeyHex: string | null = await darknodeRegistryContract.methods.getDarknodePublicKey(darknode).call();

    if (darknodeKeyHex === null || darknodeKeyHex.length === 0) {
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

function shareToBuffer(share: shamir.Share, byteCount = 8): EncodedData {
    // TODO: Check that bignumber isn't bigger than 8 bytes (64 bits)
    // Serialize number to 8-byte array (64-bits) (big-endian)
    try {

        /* Total: 40
        64bit: index
        64bit: length of share.value (32)
        64bit: length of prime (4)
        64bit: prime
        64bit: length of value (4)
        64bit: value
        */

        // TODO: Calculate length of prime and value
        const indexBytes = new BN(share.index).toArrayLike(Buffer, "be", byteCount);
        const shareLengthBytes = new BN(byteCount + byteCount + 8 + 8).toArrayLike(Buffer, "be", byteCount);
        const primeLengthBytes = new BN(8).toArrayLike(Buffer, "be", byteCount);
        const primeBytes = shamir.PRIME.toArrayLike(Buffer, "be", 8);
        const shareValueLengthBytes = new BN(8).toArrayLike(Buffer, "be", byteCount);
        const shareValueBytes = share.value.toArrayLike(Buffer, "be", 8);

        const bytes = Buffer.concat([indexBytes, shareLengthBytes, primeLengthBytes, primeBytes, shareValueLengthBytes, shareValueBytes]);

        return new EncodedData(bytes, Encodings.BUFFER);
    } catch (error) {
        throw updateError(`${error.message}: ${share.index}, ${share.value.toString()}`, error);
    }
}

export const encryptForDarknode = async ([share, darknodeKeyP]: [shamir.Share, Promise<NodeRSAType | null>]): Promise<EncodedData> => {
    const darknodeKey = await darknodeKeyP;

    if (darknodeKey === null) {
        throw new Error("Darknode key is null");
    }

    const bytes = shareToBuffer(share, 8);

    return new EncodedData(darknodeKey.encrypt(bytes.toBuffer(), "buffer"), Encodings.BUFFER);
};

export const shareToEncodedData = async ([share, darknodeKeyP]: [shamir.Share, Promise<NodeRSAType | null>]): Promise<EncodedData> => {
    return shareToBuffer(share, 8);
};

/*
 * Retrieve all the darknodes registered in the current epoch.
 * The getDarknodes() function will always return an array of {count} with empty
 * values being the NULL address. These addresses must be filtered out.
 * When the {start} value is not the NULL address, it is always returned as the
 * first entry so it should not be re-added to the list of all darknodes.
 */
async function getAllDarknodes(web3: Web3, darknodeRegistryContract: Contract): Promise<string[]> {
    const batchSize = web3.utils.toHex(50);

    const allDarknodes = [];
    let lastDarknode = NULL;
    do {
        const darknodes: string[] = await darknodeRegistryContract.methods.getDarknodes(lastDarknode, batchSize).call();
        allDarknodes.push(...darknodes.filter(addr => addr !== NULL && addr !== lastDarknode));
        [lastDarknode] = darknodes.slice(-1);
    } while (lastDarknode !== NULL);

    return allDarknodes;
}

async function getPods(
    web3: Web3,
    renexNode: string,
    darknodeRegistryContract: Contract,
    simpleConsole: SimpleConsole,
    marketID: string,
): Promise<List<Pod>> {
    const res = await axios.get<string[]>(`${renexNode}/pods?pair=${marketID}`);

    const podsForPair = res.data;
    const allPods = await getAllPods(web3, darknodeRegistryContract, simpleConsole);
    return allPods.filter((pod: Pod) => podsForPair.includes(pod.id));
}

/*
 * Calculate pod arrangement based on current epoch
 */
async function getAllPods(web3: Web3, darknodeRegistryContract: Contract, simpleConsole: SimpleConsole): Promise<List<Pod>> {
    const darknodes = await getAllDarknodes(web3, darknodeRegistryContract);
    const minimumPodSize = new BN(await darknodeRegistryContract.methods.minimumPodSize().call()).toNumber();
    simpleConsole.log(`Using minimum pod size ${minimumPodSize}`);
    const epoch: [string, string] = await darknodeRegistryContract.methods.currentEpoch().call();

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

    for (let i = 0; i < numberOfPods * minimumPodSize; i++) {
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
