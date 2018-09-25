import { BN } from "bn.js";

import RenExSDK, { TokenCode } from "../index";

import { _authorizeAtom, _connectToAtom, AtomicConnectionStatus, challengeSwapper, checkSigner, getAtomicBalances } from "../lib/atomic";
import { Token } from "../lib/market";
import { OrderSettlement, OrderStatus } from "../types";

/* Atomic Connection */

export const currentAtomConnectionStatus = (sdk: RenExSDK): AtomicConnectionStatus => {
    return sdk._atomConnectionStatus;
};

export const atomConnected = (sdk: RenExSDK): boolean => {
    const status = sdk.currentAtomConnectionStatus();
    return (
        status === AtomicConnectionStatus.ConnectedLocked ||
        status === AtomicConnectionStatus.ConnectedUnlocked
    );
};

export const resetAtomConnection = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    sdk._atomConnectedAddress = "";
    sdk._atomConnectionStatus = AtomicConnectionStatus.NotConnected;
    return refreshAtomConnectionStatus(sdk);
};

export const refreshAtomConnectionStatus = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    let status = sdk._atomConnectionStatus;
    try {
        const response = await challengeSwapper();
        const signerAddress = checkSigner(sdk.web3(), response);
        if (sdk._atomConnectedAddress === "") {
            const expectedEthAddress = await getAtomicBalances().then(resp => resp.ethereum.address);
            if (expectedEthAddress === signerAddress) {
                sdk._atomConnectedAddress = signerAddress;
            } else {
                // The signer and the balances address is different
                status = AtomicConnectionStatus.InvalidSwapper;
            }
        } else if (sdk._atomConnectedAddress !== signerAddress) {
            // A new address was used to sign swapper messages
            status = AtomicConnectionStatus.InvalidSwapper;
        } else {
            status = await _connectToAtom(response, sdk._networkData.ingress, sdk.address());
        }
    } catch (error) {
        console.error(error);
        status = AtomicConnectionStatus.NotConnected;
    }
    sdk._atomConnectionStatus = status;
    return sdk._atomConnectionStatus;
};

export const authorizeAtom = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    return sdk.atomicAddress(Token.ETH).then(ethAtomAddress => {
        return _authorizeAtom(sdk.web3(), sdk._networkData.ingress, ethAtomAddress, sdk.address()).then(status => {
            sdk._atomConnectionStatus = status;
            return status;
        });
    });
};

/* Atomic balances */

export const supportedTokens = async (sdk: RenExSDK): Promise<TokenCode[]> => [Token.BTC, Token.ETH];

export const atomicBalances = (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    return getAtomicBalances().then(balances => {
        return tokens.map(token => {
            switch (token) {
                case Token.ETH:
                    return new BN(balances.ethereum.amount);
                case Token.BTC:
                    return new BN(balances.bitcoin.amount);
            }
            return new BN(0);
        });
    });
};

export const atomicBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    return atomicBalances(sdk, [token]).then(balances => balances[0]);
};

export const atomicAddresses = (sdk: RenExSDK, tokens: number[]): Promise<string[]> => {
    return getAtomicBalances().then(balances => {
        return tokens.map(token => {
            switch (token) {
                case Token.ETH:
                    return balances.ethereum.address;
                case Token.BTC:
                    return balances.bitcoin.address;
            }
            return "";
        });
    });
};

export const atomicAddress = async (sdk: RenExSDK, token: number): Promise<string> => {
    return atomicAddresses(sdk, [token]).then(addresses => addresses[0]);
};

export const usableAtomicBalances = async (sdk: RenExSDK, tokens: number[]): Promise<BN[]> => {
    const usedOrderBalances = sdk.listTraderOrders().then(orders => {
        const usedFunds = new Map<number, BN>();
        orders.forEach(order => {
            if (order.orderInputs.orderSettlement === OrderSettlement.RenExAtomic &&
                (order.status === OrderStatus.NOT_SUBMITTED ||
                    order.status === OrderStatus.OPEN ||
                    order.status === OrderStatus.CONFIRMED)
            ) {
                const token = order.orderInputs.spendToken;
                const usedTokenBalance = usedFunds.get(token);
                if (usedTokenBalance) {
                    usedFunds.set(token, usedTokenBalance.add(order.computedOrderDetails.spendVolume));
                } else {
                    usedFunds.set(token, order.computedOrderDetails.spendVolume);
                }
            }
        });
        return usedFunds;
    });

    return Promise.all([atomicBalances(sdk, tokens), usedOrderBalances]).then(([
        startingBalance,
        orderBalance,
    ]) => {
        tokens.forEach((token, index) => {
            const ob = orderBalance.get(token) || new BN(0);
            // Don't let this balance value be negative.
            startingBalance[index] = BN.max(new BN(0), startingBalance[index].sub(ob));
        });
        return startingBalance;
    });
};

export const usableAtomicBalance = async (sdk: RenExSDK, token: number): Promise<BN> => {
    return usableAtomicBalances(sdk, [token]).then(balances => balances[0]);
};
