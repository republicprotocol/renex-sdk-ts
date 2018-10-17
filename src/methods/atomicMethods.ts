import { BN } from "bn.js";

import RenExSDK, { TokenCode } from "../index";

import { _authorizeAtom, _connectToAtom, challengeSwapper, checkSigner, getAtomicBalances } from "../lib/atomic";
import { AtomicBalanceDetails, AtomicConnectionStatus, OrderSettlement, OrderStatus, Token } from "../types";

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
    sdk._atomConnectionStatus = await getAtomConnectionStatus(sdk);
    return sdk._atomConnectionStatus;
};

const getAtomConnectionStatus = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    try {
        const response = await challengeSwapper();
        const signerAddress = checkSigner(sdk.web3(), response);
        if (sdk._atomConnectedAddress === "") {
            const expectedEthAddress = await getAtomicBalances().then(resp => resp.ethereum.address);
            if (expectedEthAddress !== signerAddress) {
                // The signer and the balances address is different
                return AtomicConnectionStatus.InvalidSwapper;
            }
            sdk._atomConnectedAddress = signerAddress;
        } else if (sdk._atomConnectedAddress !== signerAddress) {
            // A new address was used to sign swapper messages
            return AtomicConnectionStatus.ChangedSwapper;
        }
        const x = _connectToAtom(response, sdk._networkData.ingress, sdk.address());
        return x;
    } catch (err) {
        return AtomicConnectionStatus.NotConnected;
    }
};

export const authorizeAtom = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    const ethAtomAddress = await atomicAddresses([Token.ETH]).then(addrs => addrs[0]);
    await _authorizeAtom(sdk.web3(), sdk._networkData.ingress, ethAtomAddress, sdk.address());
    return refreshAtomConnectionStatus(sdk);
};

/* Atomic balances */

export const supportedAtomicTokens = async (sdk: RenExSDK): Promise<TokenCode[]> => [Token.BTC, Token.ETH];

const retrieveAtomicBalances = (tokens: TokenCode[]): Promise<BN[]> => {
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

export const atomicAddresses = (tokens: TokenCode[]): Promise<string[]> => {
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

const usedAtomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<BN[]> => {
    return sdk.listTraderOrders().then(orders => {
        const usedFunds = new Map<TokenCode, BN>();
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
        return tokens.map(token => usedFunds.get(token) || new BN(0));
    });
};

export const atomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<Map<TokenCode, AtomicBalanceDetails>> => {
    return Promise.all([retrieveAtomicBalances(tokens), usedAtomicBalances(sdk, tokens)]).then(([
        startingBalance,
        usedBalance,
    ]) => {
        let atomicBalance = new Map<TokenCode, AtomicBalanceDetails>();
        tokens.forEach((token, index) => {
            atomicBalance = atomicBalance.set(token, {
                used: usedBalance[index],
                free: BN.max(new BN(0), startingBalance[index].sub(usedBalance[index])),
            });
        });
        return atomicBalance;
    });
};
