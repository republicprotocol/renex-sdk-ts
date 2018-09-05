import BigNumber from "bignumber.js";
import { BN } from "bn.js";

import * as ingress from "@Lib/ingress";

import RenExSDK, { FloatInput, IntInput, OrderID, OrderStatus } from "@Root/index";

import { DarknodeRegistry, Orderbook, RenExTokens, withProvider } from "@Contracts/contracts";
import { adjustDecimals } from "@Lib/balances";
import { EncodedData, Encodings } from "@Lib/encodedData";
import { OrderSettlement } from "@Lib/market";
import { NetworkData } from "@Lib/network";
import { GenerateTokenPairing } from "@Lib/tokens";

export interface Order {
    orderSettlement?: OrderSettlement;
    sellToken: number;
    buyToken: number;
    price: FloatInput;
    volume: IntInput;
    minimumVolume: IntInput;
}

// TODO: Read these from the contract
const PRICE_OFFSET = 12;
const VOLUME_OFFSET = 12;

export const openOrder = async (sdk: RenExSDK, orderObj: Order): Promise<void> => {
    // TODO: check balance, min volume is profitable, and token, price, volume, and min volume are valid

    // Initialise required contracts
    sdk.contracts.darknodeRegistry = sdk.contracts.darknodeRegistry || await withProvider(sdk.web3, DarknodeRegistry).at(NetworkData.contracts[0].darknodeRegistry);
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await withProvider(sdk.web3, RenExTokens).at(NetworkData.contracts[0].renExTokens);
    const buyToken = await sdk.contracts.renExTokens.tokens(new BN(orderObj.buyToken.toFixed()));

    const price = adjustDecimals(orderObj.price, 0, PRICE_OFFSET);

    // We convert the volume and minimumVolume to 10^12
    const volume = adjustDecimals(orderObj.volume, buyToken.decimals, VOLUME_OFFSET);
    const minimumVolume = adjustDecimals(orderObj.minimumVolume, buyToken.decimals, VOLUME_OFFSET);

    let ingressOrder = new ingress.Order({
        type: ingress.OrderType.LIMIT,
        parity: orderObj.buyToken < orderObj.sellToken ? ingress.OrderParity.BUY : ingress.OrderParity.SELL,
        orderSettlement: orderObj.orderSettlement ? orderObj.orderSettlement : OrderSettlement.RenEx,
        expiry: Math.round(new Date().getTime() / 1000) + (60 * 60 * 24),
        tokens: GenerateTokenPairing(orderObj.buyToken, orderObj.sellToken),
        price,
        volume,
        minimumVolume,
        nonce: ingress.randomNonce(() => new BN(sdk.web3.utils.randomHex(8).slice(2), "hex")),
    });

    const orderID = ingress.getOrderID(sdk.web3, ingressOrder);
    ingressOrder = ingressOrder.set("id", orderID.toBase64());

    // Create order fragment mapping
    const request = new ingress.OpenOrderRequest({
        address: sdk.address,
        orderFragmentMappings: [await ingress.buildOrderMapping(sdk.web3, sdk.contracts.darknodeRegistry, ingressOrder)]
    });
    const signature = await ingress.submitOrderFragments(request);

    // Submit order and the signature to the orderbook
    const tx = await sdk.contracts.orderbook.openOrder(1, signature.toString(), orderID.toHex(), { from: sdk.address });

    console.log(`Opening order: ${JSON.stringify(ingressOrder.toJS())}. Transaction: ${tx.tx.toString()}`);
};

export const cancelOrder = async (sdk: RenExSDK, orderID: OrderID): Promise<void> => {
    sdk.contracts.orderbook = sdk.contracts.orderbook || await withProvider(sdk.web3, Orderbook).at(NetworkData.contracts[0].orderbook);

    await sdk.contracts.orderbook.cancelOrder(orderID);
};

export const listOrdersByTrader = async (sdk: RenExSDK, address: string): Promise<OrderID[]> => {
    const orders = await ingress.listOrders(sdk.contracts.orderbook);
    return orders.filter(order => order[2] === address).map(order => order[0]).toArray();
};

export const listOrdersByStatus = async (sdk: RenExSDK, status: OrderStatus): Promise<OrderID[]> => {
    const orders = await ingress.listOrders(sdk.contracts.orderbook);
    return orders.filter(order => order[1] === status).map(order => order[0]).toArray();
};
