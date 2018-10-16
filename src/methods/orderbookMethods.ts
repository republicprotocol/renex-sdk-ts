import { BigNumber } from "bignumber.js";

import { BN } from "bn.js";
import { PromiEvent } from "web3/types";

import * as ingress from "../lib/ingress";

import RenExSDK from "../index";

import { submitOrderToAtom } from "../lib/atomic";
import { adjustDecimals } from "../lib/balances";
import { EncodedData, Encodings } from "../lib/encodedData";
import { ErrInsufficientBalance, ErrUnsupportedFilterStatus } from "../lib/errors";
import { Token } from "../lib/market";
import { generateTokenPairing } from "../lib/tokens";
import { GetOrdersFilter, NullConsole, Order, OrderID, OrderInputs, OrderInputsAll, OrderParity, OrderSettlement, OrderStatus, OrderType, TraderOrder, Transaction } from "../types";
import { usableAtomicBalances } from "./atomicMethods";
import { onTxHash } from "./balanceActionMethods";
import { balances } from "./balancesMethods";

// TODO: Read these from the contract
const PRICE_OFFSET = 12;
const VOLUME_OFFSET = 12;

// Default time an order is open for (24 hours)
const DEFAULT_EXPIRY_OFFSET = 60 * 60 * 24;

const populateOrderDefaults = (
    sdk: RenExSDK,
    orderInputs: OrderInputs,
    unixSeconds: number,
): OrderInputsAll => {
    return {
        spendToken: orderInputs.spendToken,
        receiveToken: orderInputs.receiveToken,
        price: new BigNumber(orderInputs.price),
        volume: new BN(orderInputs.volume),
        minimumVolume: new BN(orderInputs.minimumVolume),

        orderSettlement: orderInputs.orderSettlement ? orderInputs.orderSettlement : OrderSettlement.RenEx,
        nonce: orderInputs.nonce !== undefined ? orderInputs.nonce : ingress.randomNonce(() => new BN(sdk.web3().utils.randomHex(8).slice(2), "hex")),
        expiry: orderInputs.expiry !== undefined ? orderInputs.expiry : unixSeconds + DEFAULT_EXPIRY_OFFSET,
        type: orderInputs.type !== undefined ? orderInputs.type : OrderType.LIMIT,
    };
};

export const orderFeeNumerator = async (sdk: RenExSDK): Promise<BN> => {
    return Promise.resolve(new BN(2));
};

export const orderFeeDenominator = async (sdk: RenExSDK): Promise<BN> => {
    return Promise.resolve(new BN(1000));
};

export const openOrder = async (
    sdk: RenExSDK,
    orderInputsIn: OrderInputs,
    simpleConsole = NullConsole,
): Promise<{ traderOrder: TraderOrder, promiEvent: PromiEvent<Transaction> | null }> => {
    const unixSeconds = Math.floor(new Date().getTime() / 1000);
    const orderInputs = populateOrderDefaults(sdk, orderInputsIn, unixSeconds);

    // Initialize required contracts
    simpleConsole.log("Retrieving token details");
    const receiveToken = await sdk.tokenDetails(new BN(orderInputs.receiveToken).toNumber());
    const spendToken = await sdk.tokenDetails(new BN(orderInputs.spendToken).toNumber());

    const parity = orderInputs.receiveToken < orderInputs.spendToken ? OrderParity.SELL : OrderParity.BUY;
    const nonPriorityDecimals = orderInputs.receiveToken < orderInputs.spendToken ? spendToken.decimals : receiveToken.decimals;
    const priorityDecimals = orderInputs.receiveToken < orderInputs.spendToken ? receiveToken.decimals : spendToken.decimals;
    const convertedVolume = adjustDecimals(new BigNumber(orderInputs.volume.toString()), nonPriorityDecimals, priorityDecimals);
    const priorityVolume = new BN(new BigNumber(convertedVolume.toString()).times(orderInputs.price).integerValue(BigNumber.ROUND_DOWN).toFixed());
    const nonPriorityToken = orderInputs.receiveToken < orderInputs.spendToken ? orderInputs.spendToken : orderInputs.receiveToken;

    const spendVolume = parity === OrderParity.BUY ? priorityVolume : orderInputs.volume;
    const receiveVolume = parity === OrderParity.BUY ? orderInputs.volume : priorityVolume;
    const nonPriorityVolume = orderInputs.receiveToken < orderInputs.spendToken ? spendVolume : receiveVolume;

    const feeNumerator = await orderFeeNumerator(sdk);
    const feeDenominator = await orderFeeDenominator(sdk);
    const feeToken = orderInputs.orderSettlement === OrderSettlement.RenExAtomic && nonPriorityToken === Token.ETH ? Token.ETH : orderInputs.receiveToken;
    const feeAmount = (nonPriorityToken === Token.ETH || parity === OrderParity.BUY ? nonPriorityVolume : priorityVolume).div(feeDenominator).mul(feeNumerator);

    // TODO: check min volume is profitable, and token, price, volume, and min volume are valid
    const retrievedBalances = await balances(sdk, [orderInputs.spendToken, feeToken]);
    let balance = new BN(0);
    simpleConsole.log("Verifying trader balance");
    if (orderInputs.orderSettlement === OrderSettlement.RenEx) {
        const spendTokenBalance = retrievedBalances.get(orderInputs.spendToken);
        if (spendTokenBalance) {
            balance = spendTokenBalance.free;
        }
    } else {
        try {
            balance = await usableAtomicBalances(sdk, [orderInputs.spendToken]).then(b => b[0]);
        } catch (err) {
            simpleConsole.error(err.message || err);
            throw err;
        }
    }
    if (spendVolume.gt(balance)) {
        simpleConsole.error(ErrInsufficientBalance);
        throw new Error(ErrInsufficientBalance);
    }
    if (orderInputs.price.lte(new BigNumber(0))) {
        simpleConsole.error("Invalid price");
        throw new Error("Invalid price");
    }
    if (orderInputs.volume.lte(new BN(0))) {
        simpleConsole.error("Invalid volume");
        throw new Error("Invalid volume");
    }
    if (orderInputs.minimumVolume.lte(new BN(0))) {
        simpleConsole.error("Invalid minimum volume");
        throw new Error("Invalid minimum volume");
    }
    if (orderInputs.volume.lt(orderInputs.minimumVolume)) {
        simpleConsole.error("Volume must be greater or equal to minimum volume");
        throw new Error("Volume must be greater or equal to minimum volume");
    }

    if (orderInputs.orderSettlement === OrderSettlement.RenExAtomic) {
        const usableFeeTokenBalance = retrievedBalances.get(feeToken);
        if (usableFeeTokenBalance && feeAmount.gt(usableFeeTokenBalance.free)) {
            simpleConsole.error("Insufficient balance for fees");
            throw new Error("Insufficient balance for fees");
        }
    }

    const price = adjustDecimals(orderInputs.price, 0, PRICE_OFFSET);

    // We convert the volume and minimumVolume to 10^12
    const decimals = orderInputs.receiveToken > orderInputs.spendToken ?
        new BN(receiveToken.decimals).toNumber() :
        new BN(spendToken.decimals).toNumber();
    const volume = adjustDecimals(orderInputs.volume, decimals, VOLUME_OFFSET);
    const minimumVolume = adjustDecimals(orderInputs.minimumVolume, decimals, VOLUME_OFFSET);

    const tokens = parity === OrderParity.BUY ?
        generateTokenPairing(orderInputs.spendToken, orderInputs.receiveToken) :
        generateTokenPairing(orderInputs.receiveToken, orderInputs.spendToken);

    let ingressOrder = new ingress.Order({
        type: orderInputs.type,
        orderSettlement: orderInputs.orderSettlement,
        expiry: orderInputs.expiry,
        nonce: orderInputs.nonce,

        parity,
        tokens,
        price,
        volume,
        minimumVolume,
    });

    const orderID = ingress.getOrderID(sdk.web3(), ingressOrder);
    ingressOrder = ingressOrder.set("id", orderID.toBase64());

    if (orderInputs.orderSettlement === OrderSettlement.RenExAtomic) {
        simpleConsole.log("Submitting order to Atomic Swapper");
        try {
            await submitOrderToAtom(orderID);
        } catch (err) {
            simpleConsole.error(err.message || err);
            throw new Error("Error sending order to Atomic Swapper");
        }
    }

    // Create order fragment mapping
    simpleConsole.log("Building order mapping");

    let orderFragmentMappings;
    try {
        orderFragmentMappings = await ingress.buildOrderMapping(sdk.web3(), sdk._contracts.darknodeRegistry, ingressOrder, simpleConsole);
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    const request = new ingress.OpenOrderRequest({
        address: sdk.address().slice(2),
        orderFragmentMappings: [orderFragmentMappings]
    });
    simpleConsole.log("Sending order fragments");
    let signature;
    try {
        signature = await ingress.submitOrderFragments(sdk._networkData.ingress, request);
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    // Submit order and the signature to the orderbook
    simpleConsole.log("Waiting for transaction signature");
    const gasPrice = await sdk.getGasPrice();
    let txHash: string;
    let promiEvent;
    try {
        ({ txHash, promiEvent } = await onTxHash(sdk._contracts.orderbook.openOrder(1, signature.toString(), orderID.toHex(), { from: sdk.address(), gasPrice })));
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    simpleConsole.log("Order submitted.");

    const traderOrder = {
        orderInputs,
        status: OrderStatus.NOT_SUBMITTED,
        trader: sdk.address(),
        id: orderID.toBase64(),
        transactionHash: txHash,
        computedOrderDetails: {
            spendVolume,
            receiveVolume,
            date: unixSeconds,
            parity,
            feeAmount,
            feeToken,
        },
    };

    sdk._storage.setOrder(traderOrder).catch(console.error);

    return { traderOrder, promiEvent };
};

export const cancelOrder = async (
    sdk: RenExSDK,
    orderID: OrderID,
): Promise<{ promiEvent: PromiEvent<Transaction> | null }> => {
    const orderIDHex = new EncodedData(orderID, Encodings.BASE64).toHex();

    const gasPrice = await sdk.getGasPrice();
    return {
        promiEvent: sdk._contracts.orderbook.cancelOrder(orderIDHex, { from: sdk.address(), gasPrice })
    };
};

export const getOrders = async (
    sdk: RenExSDK,
    filter: GetOrdersFilter,
): Promise<Order[]> => {
    const filterableStatuses = [OrderStatus.NOT_SUBMITTED, OrderStatus.OPEN, OrderStatus.CONFIRMED];
    if (filter.status && !filterableStatuses.includes(filter.status)) {
        throw new Error(ErrUnsupportedFilterStatus);
    }

    let orders = await ingress.getOrders(sdk._contracts.orderbook, filter.start, filter.limit);

    if (filter.status) {
        orders = orders.filter((order: [string, OrderStatus, string]) => order[1] === filter.status).toList();
    }

    const filterAddress = filter.address;
    if (filterAddress) {
        orders = orders.filter((order: [string, OrderStatus, string]) => order[2].toLowerCase() === filterAddress.toLowerCase()).toList();
    }

    return orders.map((order: [string, OrderStatus, string]) => ({
        id: order[0],
        status: order[1],
        trader: order[2],
    })).toArray();
};
