import { UNIMPLEMENTED } from "@Lib/errors";
import * as ingress from "@Lib/ingress";
import RenExSDK, { OrderID, OrderStatus } from "@Root/index";

export const openOrder = async (sdk: RenExSDK, order: ingress.Order): Promise<void> => {
    throw new Error(UNIMPLEMENTED);

    // const ingressOrder = ingress.openOrder(sdk.web3, sdk.account, order);

    // let signedOrder;
    // try {
    //     signedOrder = await ingress.openOrder(web3, walletDetails, address, order);
    // } catch (err) {
    //     if (err.message === ingress.ErrorCanceledByUser) {
    //         throw err;
    //     } else if (err.message === ingress.ErrorInvalidOrderDetails) {
    //         throw err;
    //     }
    //     console.error(err);
    //     throw new Error(ErrorUnableToOpen);
    // }

    // order = order.set("id", signedOrder.id);

    // const fstCode = Pairs.get(market).left;
    // const sndCode = Pairs.get(market).right;

    // // Construct new TraderOrder object. This will be used to showcase
    // // order details to trader.
    // const traderOrder = new TraderOrder({
    //     id: signedOrder.id, // Base64
    //     parity: signedOrder.parity,
    //     fstCode,
    //     sndCode,
    //     price: pricepointBN.toFixed(),
    //     volume: volumeBN.toFixed(),
    //     minimumVolume: minimumVolumeBN.toFixed(),
    //     expiry: signedOrder.expiry,
    //     date: Date.now(),
    //     trader: address,
    //     pending: true,
    //     orderSettlement: signedOrder.orderSettlement,
    // });

    // await syncLocalStorage(dispatch);
    // dispatch(addOrder({ traderOrder }));

    // // Manually update usable balance so user cannot submit orders in quick succession.
    // const primaryCode = traderOrder.parity === ingress.OrderParity.BUY ? fstCode : sndCode;
    // const usableBalance = usableBalances.get(primaryCode).minus(readableToBalance(volume, primaryCode));
    // usableBalances = usableBalances.set(primaryCode, usableBalance);
    // dispatch(updateUsableBalance({ usableBalances }));

    // // If settlement is RenExAtomic
    // if (order.orderSettlement === OrderSettlement.RenExAtomic) {
    //     try {
    //         await atomic.submitOrder(signedOrder);
    //     } catch (err) {
    //         throw err;
    //     }
    // }

    // console.log(`Opening order: ${JSON.stringify(order.toJS())}`);

    // const orderFragments = new ingress.OrderFragments({
    //     signature: signedOrder.signature,
    //     orderFragmentMappings: [await ingress.buildOrderFragmentsForPods(sdk.web3, sdk.contracts.darknodeRegistry, order)]
    // });

    // try {
    //     await ingress.submitOrderFragments(orderFragments);
    // } catch (error) {
    //     throw error;
    // }
};

export const cancelOrder = async (sdk: RenExSDK, orderID: OrderID): Promise<void> => {
    ingress.cancelOrder(sdk.web3, sdk.account, orderID);
};

export const listOrdersByTrader = async (sdk: RenExSDK, address: string): Promise<OrderID[]> => {
    throw new Error(UNIMPLEMENTED);
};

export const listOrdersByStatus = async (sdk: RenExSDK, status: OrderStatus): Promise<OrderID[]> => {
    throw new Error(UNIMPLEMENTED);
};
