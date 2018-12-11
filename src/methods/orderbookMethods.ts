import { BigNumber } from "bignumber.js";

import BN from "bn.js";
import PromiEvent from "web3/promiEvent";

import * as ingress from "../lib/ingress";

import RenExSDK from "../index";

import { normalizePrice, normalizeVolume } from "../lib/conversion";
import { EncodedData, Encodings } from "../lib/encodedData";
import { ErrFailedBalanceCheck, ErrInsufficientBalance, ErrUnsupportedFilterStatus } from "../lib/errors";
import { MarketPairs } from "../lib/market";
import { submitOrderToAtom } from "../lib/swapper";
import { MarketDetails, NullConsole, Order, OrderbookFilter, OrderID, OrderInputs, OrderInputsAll, OrderSettlement, OrderSide, OrderStatus, OrderType, SimpleConsole, Token, TraderOrder, Transaction, TransactionOptions } from "../types";
import { atomicBalances } from "./atomicMethods";
import { onTxHash } from "./balanceActionMethods";
import { balances, getTokenDetails } from "./balancesMethods";
import { getGasPrice } from "./generalMethods";
import { darknodeFees, status } from "./settlementMethods";
import { fetchTraderOrders } from "./storageMethods";

// TODO: Read these from the contract
const MIN_ETH_TRADE_VOLUME = 1;

const populateOrderDefaults = (
    orderInputs: OrderInputs,
    minEthTradeVolume: BigNumber,
    marketDetail: MarketDetails,
): OrderInputsAll => {
    const price = new BigNumber(orderInputs.price);
    const minVolume = marketDetail.base === Token.ETH ? minEthTradeVolume : calculateAbsoluteMinVolume(minEthTradeVolume, price);
    return {
        symbol: orderInputs.symbol,
        side: orderInputs.side.toLowerCase() as OrderSide,
        price,
        volume: new BigNumber(orderInputs.volume),

        minVolume: orderInputs.minVolume ? new BigNumber(orderInputs.minVolume) : minVolume,
        type: orderInputs.type !== undefined ? orderInputs.type : OrderType.LIMIT,
    };
};

export const getMinEthTradeVolume = async (sdk: RenExSDK): Promise<BigNumber> => {
    return Promise.resolve(new BigNumber(MIN_ETH_TRADE_VOLUME));
};

const calculateAbsoluteMinVolume = (minEthTradeVolume: BigNumber, price: BigNumber) => {
    return normalizeVolume(minEthTradeVolume.dividedBy(price), true);
};

const normalizeOrder = (order: OrderInputsAll): OrderInputsAll => {
    const newOrder: OrderInputsAll = Object.assign(order, {});
    newOrder.price = normalizePrice(order.price, order.side === OrderSide.SELL);
    newOrder.volume = normalizeVolume(order.volume);
    newOrder.minVolume = normalizeVolume(order.minVolume);
    return newOrder;
};

const isNormalized = (order: OrderInputsAll): boolean => {
    const priceEq = order.price.eq(normalizePrice(order.price, order.side === OrderSide.SELL));
    const volumeEq = order.volume.eq(normalizeVolume(order.volume));
    const minVolumeEq = order.minVolume.eq(normalizeVolume(order.minVolume));
    return priceEq && volumeEq && minVolumeEq;
};

const isValidDecimals = (order: OrderInputsAll, decimals: number): boolean => {
    const volumeEq = order.volume.eq(new BigNumber(order.volume.toFixed(decimals)));
    const minVolumeEq = order.minVolume.eq(new BigNumber(order.minVolume.toFixed(decimals)));
    return volumeEq && minVolumeEq;
};

export const openOrder = async (
    sdk: RenExSDK,
    orderInputsIn: OrderInputs,
    options?: TransactionOptions,
): Promise<{ traderOrder: TraderOrder, promiEvent: PromiEvent<Transaction> | null }> => {
    const marketDetail = MarketPairs.get(orderInputsIn.symbol);
    if (!marketDetail) {
        throw new Error(`Unsupported market pair: ${orderInputsIn.symbol}`);
    }

    const minEthTradeVolume = await getMinEthTradeVolume(sdk);
    const unixSeconds = Math.floor(new Date().getTime() / 1000);
    let orderInputs = populateOrderDefaults(orderInputsIn, minEthTradeVolume, marketDetail);

    const baseToken = marketDetail.base;
    const quoteToken = marketDetail.quote;
    const baseTokenDetails = await getTokenDetails(sdk, baseToken);

    if (!isValidDecimals(orderInputs, baseTokenDetails.decimals)) {
        throw new Error(`Order volumes are invalid. ${baseToken} is limited to ${baseTokenDetails.decimals} decimal places.`);
    }

    if (!isNormalized(orderInputs)) {
        if (sdk.getConfig().autoNormalizeOrders) {
            orderInputs = normalizeOrder(orderInputs);
        } else {
            throw new Error("Order inputs have not been normalized.");
        }
    }

    const orderSettlement = marketDetail.orderSettlement;

    const quoteVolume = orderInputs.volume.times(orderInputs.price);

    const spendToken = orderInputs.side === OrderSide.BUY ? quoteToken : baseToken;
    const receiveToken = orderInputs.side === OrderSide.BUY ? baseToken : quoteToken;
    const receiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.volume : quoteVolume;
    const spendVolume = orderInputs.side === OrderSide.BUY ? quoteVolume : orderInputs.volume;

    const feePercent = await darknodeFees(sdk);
    let feeToken = receiveToken;
    let feeAmount = quoteVolume.times(feePercent);
    if (orderSettlement === OrderSettlement.RenExAtomic && baseToken === Token.ETH) {
        feeToken = Token.ETH;
        feeAmount = orderInputs.volume.times(feePercent);
    }

    let balance = new BigNumber(0);

    const { simpleConsole, awaitConfirmation, gasPrice } = await defaultTransactionOptions(sdk, options);

    simpleConsole.log("Verifying trader balance");
    if (orderSettlement === OrderSettlement.RenEx) {
        const spendTokenBalance = await balances(sdk, [spendToken]).then(bal => bal.get(spendToken));
        if (spendTokenBalance) {
            if (spendTokenBalance.free === null) {
                simpleConsole.error(ErrFailedBalanceCheck);
                throw new Error(ErrFailedBalanceCheck);
            }
            balance = spendTokenBalance.free;
        }
    } else {
        try {
            const atomicBalance = await atomicBalances(sdk, [spendToken]).then(b => b.get(spendToken));
            if (atomicBalance && atomicBalance.free !== null) {
                balance = atomicBalance.free;
            }
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
    if (orderInputs.volume.lte(new BigNumber(0))) {
        simpleConsole.error("Invalid volume");
        throw new Error("Invalid volume");
    }
    if (orderInputs.minVolume.lt(new BigNumber(0))) {
        simpleConsole.error("Invalid minimum volume");
        throw new Error("Invalid minimum volume");
    }
    const absoluteMinVolume = (baseToken === Token.ETH) ? minEthTradeVolume : calculateAbsoluteMinVolume(minEthTradeVolume, orderInputs.price);
    if (orderInputs.volume.lt(absoluteMinVolume)) {
        let errMsg = `Volume must be at least ${absoluteMinVolume} ${baseToken}`;
        if (baseToken !== Token.ETH) {
            errMsg += ` or ${minEthTradeVolume} ${Token.ETH}`;
        }
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }
    if (orderInputs.minVolume.lt(absoluteMinVolume)) {
        let errMsg = `Minimum volume must be at least ${absoluteMinVolume} ${baseToken}`;
        if (baseToken !== Token.ETH) {
            errMsg += ` or ${minEthTradeVolume} ${Token.ETH}`;
        }
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }
    if (orderInputs.volume.lt(orderInputs.minVolume)) {
        const errMsg = `Volume must be greater or equal to minimum volume: (${orderInputs.minVolume})`;
        simpleConsole.error(errMsg);
        throw new Error(errMsg);
    }

    if (orderSettlement === OrderSettlement.RenExAtomic) {
        const usableFeeTokenBalance = await atomicBalances(sdk, [feeToken]).then(bal => bal.get(feeToken));
        if (usableFeeTokenBalance && usableFeeTokenBalance.free !== null && feeAmount.gt(usableFeeTokenBalance.free)) {
            simpleConsole.error("Insufficient balance for fees");
            throw new Error("Insufficient balance for fees");
        } else if (usableFeeTokenBalance && usableFeeTokenBalance.free === null) {
            simpleConsole.error(ErrFailedBalanceCheck);
            throw new Error(ErrFailedBalanceCheck);
        }
    }

    const nonce = ingress.randomNonce(() => new BN(sdk.getWeb3().utils.randomHex(8).slice(2), "hex"));
    let ingressOrder = ingress.createOrder(orderInputs, nonce);
    const orderID = ingress.getOrderID(sdk.getWeb3(), ingressOrder);
    ingressOrder = ingressOrder.set("id", orderID.toBase64());

    if (orderSettlement === OrderSettlement.RenExAtomic) {
        simpleConsole.log("Submitting order to Atomic Swapper");
        try {
            await submitOrderToAtom(orderID);
        } catch (err) {
            simpleConsole.error(err.message || err);
            throw new Error(`Error sending order to Atomic Swapper: ${err}`);
        }
    }

    // Create order fragment mapping
    simpleConsole.log("Building order mapping");

    let orderFragmentMappings;
    try {
        orderFragmentMappings = await ingress.buildOrderMapping(sdk.getWeb3(), sdk._contracts.darknodeRegistry, ingressOrder, simpleConsole);
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    const request = new ingress.OpenOrderRequest({
        address: sdk.getAddress().slice(2),
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
    let txHash: string;
    let promiEvent;
    try {
        ({ txHash, promiEvent } = await onTxHash(sdk._contracts.orderbook.openOrder(sdk.getWeb3().utils.toHex(1), signature.toString(), orderID.toHex(), { from: sdk.getAddress(), gasPrice })));
    } catch (err) {
        simpleConsole.error(err.message || err);
        throw err;
    }

    simpleConsole.log("Order submitted.");

    if (awaitConfirmation) {
        simpleConsole.log("Waiting for order confirmation...");
        await promiEvent;
        simpleConsole.log("Order confirmed.");
    }

    const traderOrder = {
        orderInputs,
        status: OrderStatus.NOT_SUBMITTED,
        trader: sdk.getAddress(),
        id: orderID.toBase64(),
        transactionHash: txHash,
        computedOrderDetails: {
            spendToken,
            receiveToken,
            spendVolume,
            receiveVolume,
            date: unixSeconds,
            feeAmount,
            feeToken,
            orderSettlement,
            nonce,
        },
    };

    sdk._storage.setOrder(traderOrder).catch(console.error);

    return { traderOrder, promiEvent };
};

export const cancelOrder = async (
    sdk: RenExSDK,
    orderID: OrderID,
    options?: TransactionOptions,
): Promise<{ promiEvent: PromiEvent<Transaction> | null }> => {
    const orderIDHex = new EncodedData(orderID, Encodings.BASE64).toHex();
    const { awaitConfirmation, gasPrice } = await defaultTransactionOptions(sdk, options);

    const promiEvent = sdk._contracts.orderbook.cancelOrder(orderIDHex, { from: sdk.getAddress(), gasPrice });
    if (awaitConfirmation) {
        await promiEvent;
    }
    return {
        promiEvent
    };
};

export const getOrders = async (
    sdk: RenExSDK,
    filter: OrderbookFilter,
): Promise<Order[]> => {
    const filterableStatuses = [OrderStatus.NOT_SUBMITTED, OrderStatus.OPEN, OrderStatus.CONFIRMED];
    if (filter.status && !filterableStatuses.includes(filter.status)) {
        throw new Error(ErrUnsupportedFilterStatus);
    }

    let orders = await ingress.getOrders(sdk.getWeb3(), sdk._contracts.orderbook, filter.start, filter.limit);

    if (filter.status) {
        orders = orders.filter((order: [string, OrderStatus, string]) => order[1] === filter.status).toList();
    }

    const filterAddress = filter.address;
    if (filterAddress) {
        orders = orders.filter((order: [string, OrderStatus, string]) => order[2].toLowerCase() === filterAddress.toLowerCase()).toList();
    }

    return orders.map((order: [string, OrderStatus, string]) => {
        const orderID = new EncodedData(order[0], Encodings.HEX).toBase64();
        return {
            id: orderID,
            status: order[1],
            trader: order[2],
        };
    }).toArray();
};

export const updateAllOrderStatuses = async (sdk: RenExSDK, orders?: TraderOrder[]): Promise<Map<string, OrderStatus>> => {
    const newStatuses = new Map<string, OrderStatus>();
    if (!orders) {
        orders = await fetchTraderOrders(sdk);
    }
    await Promise.all(orders.map(async order => {
        if (order.status === OrderStatus.NOT_SUBMITTED ||
            order.status === OrderStatus.OPEN) {
            const newStatus = await status(sdk, order.id);
            if (newStatus !== order.status) {
                newStatuses.set(order.id, newStatus);
            }
        }
    }));
    return newStatuses;
};

export const getOrderBlockNumber = async (sdk: RenExSDK, orderID: string): Promise<number> => {
    const orderIDHex = new EncodedData(orderID, Encodings.BASE64).toHex();
    return new BN(await sdk._contracts.orderbook.orderBlockNumber(orderIDHex)).toNumber();
};

export const defaultTransactionOptions = async (sdk: RenExSDK, options?: TransactionOptions): Promise<{
    awaitConfirmation: boolean;
    gasPrice: number | undefined;
    simpleConsole: SimpleConsole;
}> => {
    let awaitConfirmation = true;
    let gasPrice;
    let simpleConsole = NullConsole;
    if (options) {
        awaitConfirmation = options.awaitConfirmation || awaitConfirmation;
        gasPrice = options.gasPrice || await getGasPrice(sdk);
        simpleConsole = options.simpleConsole || simpleConsole;
    }
    return {
        awaitConfirmation,
        gasPrice,
        simpleConsole,
    };
};
