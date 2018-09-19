import { BN } from "bn.js";

import RenExSDK, { TokenCode, TraderOrder } from "../index";

import { _connectToAtom, AtomicConnectionStatus, AtomicSwapStatus, getAtomicBalances, getOrderStatus } from "../lib/atomic";
import { EncodedData, Encodings } from "../lib/encodedData";

/* Atomic Connection */

export const atomConnectionStatus = (sdk: RenExSDK): AtomicConnectionStatus => {
    return sdk._atomConnectionStatus;
};

export const atomConnected = (sdk: RenExSDK): boolean => {
    const status = sdk.atomConnectionStatus();
    return (
        status === AtomicConnectionStatus.ConnectedLocked ||
        status === AtomicConnectionStatus.ConnectedUnlocked
    );
};

export const connectToAtom = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    sdk._atomConnectionStatus = await _connectToAtom(sdk.web3(), sdk.address());
    return sdk._atomConnectionStatus;
};

export const authorizeAtom = async (sdk: RenExSDK) => {
    // Not supported yet
};

/* Atomic Order Status */

export const atomicSwapStatus = async (sdk: RenExSDK, orderID64: string): Promise<AtomicSwapStatus> => {
    const orderID = new EncodedData(orderID64, Encodings.BASE64);

    const connectionStatus = sdk.atomConnectionStatus();
    if (!sdk.atomConnected()) { throw new Error("Not connected to Atomic"); }

    const swapStatus: AtomicSwapStatus = await getOrderStatus(orderID);

    // Update local storage (without awaiting)
    sdk._storage.getOrder(orderID64).then(async (storedOrder: TraderOrder) => {
        if (storedOrder !== null) {
            storedOrder.atomicSwapStatus = swapStatus;
            await sdk._storage.setOrder(storedOrder);
        }
    }).catch(console.error);

    return swapStatus;
};

/* Atomic balances */

export const supportedTokens = async (sdk: RenExSDK): Promise<TokenCode[]> => [0, 1];

export const atomicBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {

    const connectionStatus = sdk.atomConnectionStatus();
    if (!sdk.atomConnected()) { throw new Error("Not connected to Atomic"); }

    const atomicBalanceResponse = await getAtomicBalances();

    for (const balanceItem of atomicBalanceResponse) {
        if (balanceItem.priorityCode === token) {
            return new BN(balanceItem.amount);
        }
    }

    // We return 0 if no balance is found
    throw new Error(`Could not retrieve Atomic balance for token #${token}`);
};

export const atomicBalances = (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    // Loop through all tokens, returning 0 for any that throw an error
    return Promise.all(tokens.map((async (token) => {
        try {
            return sdk.atomicBalance(token);
        } catch (err) {
            return new BN(0);
        }
    })));
};

export const usableAtomicBalance = async (sdk: RenExSDK, token: number): Promise<any> => {
    throw new Error("unimplemented");

    // // Remove balances used for open orders from usable balances.
    // traderOrders.map((order: TraderOrder) => {
    //     if (
    //         //     (
    //         //     order.status !== OrderStatus.Open &&
    //         //     order.status !== OrderStatus.Unknown &&
    //         //     order.status !== OrderStatus.Confirmed
    //         // ) ||
    //         order.trader !== sdk.address() ||
    //         order.orderSettlement !== OrderSettlement.RenExAtomic
    //     ) {
    //         return;
    //     }

    //     const volumeBN = readableToBalance(order.volume.toString(), order.parity === OrderParity.BUY ? order.fstCode : order.sndCode);
    //     const primaryToken = order.parity === OrderParity.BUY ? order.fstCode : order.sndCode;
    //     let usableAtomicBalance = usableAtomicBalances.get(primaryToken);
    //     usableAtomicBalance = usableAtomicBalance.sub(volumeBN);

    //     if (usableAtomicBalance.lt(new BN(0))) {
    //         usableAtomicBalance = new BN(0);
    //     }
    //     usableAtomicBalances = usableAtomicBalances.set(primaryToken, usableAtomicBalance);
    // });

    // if (!usableAtomicBalances.equals(oldUsableAtomicBalances)) {
    //     // dispatch(updateUsableAtomicBalance({ usableAtomicBalances }));
    // }
};
