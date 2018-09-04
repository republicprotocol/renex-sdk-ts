import BigNumber from "bignumber.js";

import { BN } from "bn.js";

import * as ingress from "@Lib/ingress";

import RenExSDK, { FloatInput, IntInput, OrderID, OrderStatus } from "@Root/index";

import { adjustDecimals } from "@Lib/balances";
import { EncodedData, Encodings } from "@Lib/encodedData";
import { UNIMPLEMENTED } from "@Lib/errors";
import { OrderSettlement } from "@Lib/market";
import { TokenPairToNumber } from "@Lib/tokens";

export interface Order {
    orderSettlement?: OrderSettlement;
    sellToken: BigNumber;
    buyToken: BigNumber;
    price: FloatInput;
    volume: IntInput;
    minimumVolume: IntInput;
}

// TODO: Read these from the contract
const PRICE_OFFSET = 12;
const VOLUME_OFFSET = 12;

export const openOrder = async (sdk: RenExSDK, orderObj: Order): Promise<void> => {
    // TODO: check balance, min volume is profitable, and token, price, volume, and min volume are valid
    const sellToken = await sdk.contracts.renExTokens.tokens(new BN(orderObj.sellToken.toFixed()));
    const buyToken = await sdk.contracts.renExTokens.tokens(new BN(orderObj.buyToken.toFixed()));

    const price = adjustDecimals(orderObj.price, 0, PRICE_OFFSET);

    // We convert the volume and minimumVolume to 10^12
    const volume = adjustDecimals(orderObj.volume, buyToken.decimals, VOLUME_OFFSET);
    const minimumVolume = adjustDecimals(orderObj.minimumVolume, buyToken.decimals, VOLUME_OFFSET);

    let ingressOrder = new ingress.Order({
        type: ingress.OrderType.LIMIT,
        parity: ingress.OrderParity.BUY,
        orderSettlement: orderObj.orderSettlement ? orderObj.orderSettlement : OrderSettlement.RenEx,
        expiry: Math.round(new Date().getTime() / 1000) + (60 * 60 * 24),
        tokens: TokenPairToNumber(orderObj.buyToken, orderObj.sellToken),
        price,
        volume,
        minimumVolume,
        nonce: ingress.randomNonce(() => new BN(sdk.web3.utils.randomHex(8).slice(2), "hex")),
    });

    ingressOrder = ingressOrder.set("id", ingress.getOrderID(sdk.web3, ingressOrder));

    // Create order fragment mapping
    const req = new ingress.OpenOrderRequest({
        address: sdk.address,
        orderFragmentMappings: [await ingress.buildOrderFragmentsForPods(sdk.web3, sdk.contracts.darknodeRegistry, ingressOrder)]
    });
    const resp = await ingress.submitOrderFragments(req);
    const sig = new EncodedData(resp, Encodings.BASE64);

    // Submit order and the signature to the orderbook
    const tx = await sdk.contracts.orderbook.openOrder(1, sig.toString(), ingressOrder.id);

    console.log(`Opening order: ${JSON.stringify(ingressOrder.toJS())}. Transaction: ${tx.tx.toString()}`);
};

export const cancelOrder = async (sdk: RenExSDK, orderID: OrderID): Promise<void> => {
    ingress.cancelOrder(sdk.web3, sdk.address, orderID);
};

export const listOrdersByTrader = async (sdk: RenExSDK, address: string): Promise<OrderID[]> => {
    throw new Error(UNIMPLEMENTED);
};

export const listOrdersByStatus = async (sdk: RenExSDK, status: OrderStatus): Promise<OrderID[]> => {
    throw new Error(UNIMPLEMENTED);
};
