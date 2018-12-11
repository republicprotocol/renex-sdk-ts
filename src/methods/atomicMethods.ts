import BigNumber from "bignumber.js";

import RenExSDK, { TokenCode } from "../index";

import { EncodedData } from "../lib/encodedData";
import { MarketPairs } from "../lib/market";
import { _authorizeAtom, _connectToAtom, getAtomicBalances, submitSwap, SwapBlob, signMessage } from "../lib/swapper";
import { fromSmallestUnit, toSmallestUnit } from "../lib/tokens";
import { AtomicBalanceDetails, AtomicConnectionStatus, OrderInputsAll, OrderSettlement, OrderSide, OrderStatus, Token } from "../types";
import { getTokenDetails } from "./balancesMethods";
import { fetchTraderOrders } from "./storageMethods";

/* Atomic Connection */

type MaybeBigNumber = BigNumber | null;

export const currentAtomConnectionStatus = (sdk: RenExSDK): AtomicConnectionStatus => {
    return sdk._atomConnectionStatus;
};

export const atomConnected = (sdk: RenExSDK): boolean => {
    const status = currentAtomConnectionStatus(sdk);
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
    /*
    try {
        const response = await challengeSwapper();
        const signerAddress = checkSigner(sdk.getWeb3(), response);
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
        if (sdk.getAddress()) {
            return _connectToAtom(response, sdk._networkData.ingress, sdk.getAddress());
        }
        return AtomicConnectionStatus.NotConnected;
    } catch (err) {
        return AtomicConnectionStatus.NotConnected;
    }
    */
    return AtomicConnectionStatus.ConnectedUnlocked;
};

export const authorizeAtom = async (sdk: RenExSDK): Promise<AtomicConnectionStatus> => {
    const ethAtomAddress = await atomicAddresses(sdk, [Token.ETH]).then(addrs => addrs[0]);
    await _authorizeAtom(sdk.getWeb3(), sdk._networkData.ingress, ethAtomAddress, sdk.getAddress());
    return refreshAtomConnectionStatus(sdk);
};

/* Atomic balances */

export const supportedAtomicTokens = async (sdk: RenExSDK): Promise<TokenCode[]> => [Token.BTC, Token.ETH];

const retrieveAtomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<MaybeBigNumber[]> => {
    return getAtomicBalances({ network: sdk._networkData.network }).then(balances => {
        return Promise.all(tokens.map(async token => {
            const tokenDetails = await getTokenDetails(sdk, token);
            if (balances[token]) {
                const balance = balances[token].balance;
                return fromSmallestUnit(new BigNumber(balance), tokenDetails);
            }
            return null;
        }));
    });
};

export const atomicAddresses = (sdk: RenExSDK, tokens: TokenCode[]): Promise<string[]> => {
    return getAtomicBalances({ network: sdk._networkData.network }).then(balances => {
        return Promise.all(tokens.map(async token => {
            if (balances[token]) {
                return balances[token].address;
            }
            return "";
        }));
    });
};

const usedAtomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<BigNumber[]> => {
    return fetchTraderOrders(sdk).then(orders => {
        const usedFunds = new Map<TokenCode, BigNumber>();
        orders.forEach(order => {
            if (order.computedOrderDetails.orderSettlement === OrderSettlement.RenExAtomic &&
                (order.status === OrderStatus.NOT_SUBMITTED ||
                    order.status === OrderStatus.OPEN ||
                    order.status === OrderStatus.CONFIRMED)
            ) {
                const token = order.computedOrderDetails.spendToken;
                const usedTokenBalance = usedFunds.get(token);
                if (usedTokenBalance) {
                    usedFunds.set(token, usedTokenBalance.plus(order.computedOrderDetails.spendVolume));
                } else {
                    usedFunds.set(token, order.computedOrderDetails.spendVolume);
                }
            }
        });
        return tokens.map(token => usedFunds.get(token) || new BigNumber(0));
    });
};

export const atomicBalances = async (sdk: RenExSDK, tokens: TokenCode[]): Promise<Map<TokenCode, AtomicBalanceDetails>> => {
    return Promise.all([retrieveAtomicBalances(sdk, tokens), usedAtomicBalances(sdk, tokens)]).then(([
        startingBalance,
        usedBalance,
    ]) => {
        let atomicBalance = new Map<TokenCode, AtomicBalanceDetails>();
        tokens.forEach((token, index) => {
            let free: MaybeBigNumber = null;
            if (startingBalance[index] !== null) {
                free = BigNumber.max(new BigNumber(0), (startingBalance[index] as BigNumber).minus(usedBalance[index]));
            }
            atomicBalance = atomicBalance.set(token, {
                used: usedBalance[index],
                free,
            });
        });
        return atomicBalance;
    });
};

// tslint:disable-next-line:no-any
export const submitOrder = async (sdk: RenExSDK, orderID: EncodedData, orderInputs: OrderInputsAll): Promise<any> => {
    const marketDetail = MarketPairs.get(orderInputs.symbol);
    if (!marketDetail) {
        throw new Error(`Unsupported market pair: ${orderInputs.symbol}`);
    }
    const baseToken = marketDetail.base;
    const quoteToken = marketDetail.quote;
    const quoteVolume = orderInputs.volume.times(orderInputs.price);

    const spendToken = orderInputs.side === OrderSide.BUY ? quoteToken : baseToken;
    const receiveToken = orderInputs.side === OrderSide.BUY ? baseToken : quoteToken;
    const receiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.volume : quoteVolume;
    const minimumReceiveVolume = orderInputs.side === OrderSide.BUY ? orderInputs.minVolume : orderInputs.price.times(orderInputs.minVolume);
    const spendVolume = orderInputs.side === OrderSide.BUY ? quoteVolume : orderInputs.volume;
    const spendTokenDetails = await getTokenDetails(sdk, spendToken);
    const receiveTokenDetails = await getTokenDetails(sdk, receiveToken);
    const tokenAddress = await atomicAddresses(sdk, [spendToken, receiveToken]);
    const message = {
        order_id: orderID.toBase64(),
        kyc_addr: sdk.getAddress(),
        send_token_addr: tokenAddress[0],
        receive_token_addr: tokenAddress[1],
    };
    const signature = await signMessage(sdk.getWeb3(), sdk.getAddress(), JSON.stringify(message));

    const req: SwapBlob = {
        sendToken: spendToken,
        receiveToken,
        sendAmount: toSmallestUnit(spendVolume, spendTokenDetails).toString(),
        receiveAmount: toSmallestUnit(receiveVolume, receiveTokenDetails).toString(),
        minimumReceiveAmount: toSmallestUnit(minimumReceiveVolume, receiveTokenDetails).toString(),
        delayed: true,
        delayCallbackUrl: `${sdk._networkData.ingress}/swapperd/cb`,
        delayInfo: {
            message,
            signature,
        }
    };
    console.log(JSON.stringify(req));
    return submitSwap(req, sdk._networkData.network);
};
