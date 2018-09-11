import { BN } from "bn.js";

import * as ingress from "../lib/ingress";

import RenExSDK, { HiddenOrder, ListOrdersFilter, Order, OrderID, OrderStatus } from "../index";

import { adjustDecimals } from "../lib/balances";
import { EncodedData, Encodings } from "../lib/encodedData";
import { ErrUnsupportedFilterStatus } from "../lib/errors";
import { OrderSettlement } from "../lib/market";
import { generateTokenPairing } from "../lib/tokens";

// TODO: Read these from the contract
const PRICE_OFFSET = 12;
const VOLUME_OFFSET = 12;

export const verifyOrder = async (sdk: RenExSDK, orderObj: Order): Promise<Order> => {
    // TODO: check balance, min volume is profitable, and token, price, volume, and min volume are valid

    const buyToken = await sdk.contracts.renExTokens.tokens(new BN(orderObj.buyToken).toNumber());
    const sellToken = await sdk.contracts.renExTokens.tokens(new BN(orderObj.sellToken).toNumber());

    if (orderObj.nonce === undefined) {
        orderObj.nonce = ingress.randomNonce(() => new BN(sdk.web3.utils.randomHex(8).slice(2), "hex"));
    }

    if (orderObj.expiry === undefined) {
        orderObj.expiry = Math.round(new Date().getTime() / 1000) + (60 * 60 * 24);
    }

    const price = adjustDecimals(orderObj.price, 0, PRICE_OFFSET);

    // We convert the volume and minimumVolume to 10^12
    const decimals = orderObj.buyToken > orderObj.sellToken ? buyToken.decimals : sellToken.decimals;
    const volume = adjustDecimals(orderObj.volume, decimals, VOLUME_OFFSET);
    const minimumVolume = adjustDecimals(orderObj.minimumVolume, decimals, VOLUME_OFFSET);

    const parity = orderObj.buyToken < orderObj.sellToken ? ingress.OrderParity.SELL : ingress.OrderParity.BUY;
    const tokens = parity === ingress.OrderParity.BUY ?
        generateTokenPairing(orderObj.sellToken, orderObj.buyToken) :
        generateTokenPairing(orderObj.buyToken, orderObj.sellToken);

    let ingressOrder = new ingress.Order({
        type: ingress.OrderType.LIMIT,
        parity,
        orderSettlement: orderObj.orderSettlement ? orderObj.orderSettlement : OrderSettlement.RenEx,
        expiry: orderObj.expiry,
        tokens,
        price,
        volume,
        minimumVolume,
        nonce: orderObj.nonce,
    });

    const orderID = ingress.getOrderID(sdk.web3, ingressOrder);
    ingressOrder = ingressOrder.set("id", orderID.toBase64());

    if (orderObj.id !== undefined) {
        if (orderObj.id !== ingressOrder.id) {
            throw new Error("invalid id");
        }
    } else {
        orderObj.id = ingressOrder.id;
    }

    return orderObj;
};

export const openOrder = async (sdk: RenExSDK, orderObj: Order): Promise<void> => {
    // TODO: check balance, min volume is profitable, and token, price, volume, and min volume are valid

    orderObj = await verifyOrder(sdk, orderObj);

    // Initialize required contracts
    const buyToken = await sdk.contracts.renExTokens.tokens(new BN(orderObj.buyToken).toNumber());

    const price = adjustDecimals(orderObj.price, 0, PRICE_OFFSET);

    // We convert the volume and minimumVolume to 10^12
    const volume = adjustDecimals(orderObj.volume, buyToken.decimals, VOLUME_OFFSET);
    const minimumVolume = adjustDecimals(orderObj.minimumVolume, buyToken.decimals, VOLUME_OFFSET);

    const parity = orderObj.buyToken < orderObj.sellToken ? ingress.OrderParity.SELL : ingress.OrderParity.BUY;
    const tokens = parity === ingress.OrderParity.BUY ?
        generateTokenPairing(orderObj.sellToken, orderObj.buyToken) :
        generateTokenPairing(orderObj.buyToken, orderObj.sellToken);

    let ingressOrder = new ingress.Order({
        type: ingress.OrderType.LIMIT,
        parity,
        orderSettlement: orderObj.orderSettlement ? orderObj.orderSettlement : OrderSettlement.RenEx,
        expiry: orderObj.expiry,
        tokens,
        price,
        volume,
        minimumVolume,
        nonce: orderObj.nonce,
    });

    const orderID = ingress.getOrderID(sdk.web3, ingressOrder);
    ingressOrder = ingressOrder.set("id", orderID.toBase64());

    // Create order fragment mapping
    const request = new ingress.OpenOrderRequest({
        address: sdk.address.slice(2),
        orderFragmentMappings: [await ingress.buildOrderMapping(sdk.web3, sdk.contracts.darknodeRegistry, ingressOrder)]
    });
    const signature = await ingress.submitOrderFragments(sdk.networkData.ingress, request);

    // Submit order and the signature to the orderbook
    const tx = await sdk.contracts.orderbook.openOrder(1, signature.toString(), orderID.toHex(), { from: sdk.address });

    console.log(`Opening order: ${JSON.stringify(ingressOrder.toJS())}. Transaction: ${tx.tx.toString()}`);
};

export const cancelOrder = async (sdk: RenExSDK, orderID: OrderID): Promise<void> => {
    const orderIDHex = new EncodedData(orderID, Encodings.BASE64).toHex();

    await sdk.contracts.orderbook.cancelOrder(orderIDHex, { from: sdk.address });
};

export const listOrders = async (sdk: RenExSDK, filter: ListOrdersFilter): Promise<HiddenOrder[]> => {
    const filterableStatuses = [OrderStatus.NOT_SUBMITTED, OrderStatus.OPEN, OrderStatus.CONFIRMED];
    if (filter.status && !filterableStatuses.includes(filter.status)) {
        throw new Error(ErrUnsupportedFilterStatus);
    }

    let orders = await ingress.listOrders(sdk.contracts.orderbook, filter.start, filter.limit);

    if (filter.address) {
        orders = orders.filter(order => filter.status === order[1]).toList();
    }

    if (filter.status) {
        orders = orders.filter(order => order[2].toLowerCase() === filter.status.toLowerCase()).toList();
    }

    return orders.map(order => ({
        orderID: order[0],
        status: order[1],
        trader: order[2],
    })).toArray();
};
