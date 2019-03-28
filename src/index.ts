import BigNumber from "bignumber.js";
import Web3 from "web3";

import { OrderedMap } from "immutable";
import { Contract } from "web3-eth-contract/types";
import { EthereumProvider } from "web3-providers/types";

import { errors } from "./errors";
import { generateConfig } from "./lib/config";
import { normalizePrice, normalizeVolume, toOriginalType } from "./lib/conversion";
import { EncodedData, Encodings } from "./lib/encodedData";
import { fetchMarkets } from "./lib/market";
import { NetworkData, networks } from "./lib/network";
import { MarketPair, Token, Tokens } from "./lib/tokens";
import { ReturnedSwap, SentDelayedSwap, SentNonDelayedSwap } from "./lib/types/swapObject";
import { cancelOrder } from "./methods/cancelOrder";
import { darknodeFees, minimumQuoteVolume, normalizeSwap, openOrder, openOrderToBackend, openOrderToSwapperD, validateSwap } from "./methods/openOrder";
import {
    currentSwapperDConnectionStatus, getSwapperID, getSwapperVersion,
    refreshSwapperDConnectionStatus, resetSwapperDConnection,
    swapperDAddresses, swapperDBalances, swapperDConnected, swapperDSwaps,
} from "./methods/swapperD";
import { getWrappingFees, unwrap, unwrappingFees, wrap, WrapFees, WrapFeesMap, wrappingFees } from "./methods/wrapToken";
import {
    Config, MarketDetails, NumberInput, Options, OrderID,
    OrderInputs, SimpleConsole, SwapperDBalanceDetails,
    SwapperDConnectionStatus, TokenDetails, TransactionOptions,
} from "./types";

// Contract bindings
import DarknodeRegistryABI from "./ABIs/DarknodeRegistry.json";

// Export all types
export * from "./types";
export * from "./lib/types/swapObject";
export * from "./lib/swapper";
export { errors } from "./errors";
export { getMarket } from "./lib/market";
export { MarketPairs } from "./lib/tokens";
export { populateOrderDefaults, validateUserInputs } from "./methods/openOrder";
export { MarketPair, Token, Tokens } from "./lib/tokens";

interface ContractObject {
    darknodeRegistry: Contract;
}

/**
 * This is the concrete class that implements the IRenExSDK interface.
 *
 * @class RenExSDK
 */
export class RenExSDK {
    public errors = errors;

    public _networkData: NetworkData;
    public _swapperDConnectionStatus: SwapperDConnectionStatus = SwapperDConnectionStatus.NotConnected;
    public _wrappingFees: WrapFeesMap = {};

    public _contracts: ContractObject;

    public tokenDetails: Map<Token, TokenDetails> = Tokens;

    // SwapperD functions
    public swapperD = {
        getStatus: (): SwapperDConnectionStatus => currentSwapperDConnectionStatus(this),
        getID: (): Promise<string> => getSwapperID(this),
        getVersion: (): Promise<string> => getSwapperVersion(this),
        isConnected: (): boolean => swapperDConnected(this),
        refreshStatus: (): Promise<SwapperDConnectionStatus> => refreshSwapperDConnectionStatus(this),
        resetStatus: (): Promise<SwapperDConnectionStatus> => resetSwapperDConnection(this),
        fetchBalances: (tokens: Token[]): Promise<Map<Token, SwapperDBalanceDetails>> => swapperDBalances(this, tokens),
        fetchSwaps: (): Promise<ReturnedSwap[]> => swapperDSwaps(this),
        fetchAddresses: (tokens: Token[]): Promise<string[]> => swapperDAddresses(this, tokens),
        wrap: (amount: NumberInput, token: Token): Promise<SentNonDelayedSwap> => wrap(this, amount, token),
        unwrap: (amount: NumberInput, token: Token): Promise<SentNonDelayedSwap> => unwrap(this, amount, token),
        getWrappingFees: (token: Token): Promise<WrapFees> => getWrappingFees(this, token),
    };

    public atom = this.swapperD;

    public utils = {
        normalizePrice: (price: NumberInput, roundUp?: boolean): NumberInput => {
            return toOriginalType(normalizePrice(new BigNumber(price), roundUp), price);
        },
        normalizeVolume: (volume: NumberInput, roundUp?: boolean): NumberInput => {
            return toOriginalType(normalizeVolume(new BigNumber(volume), roundUp), volume);
        },
    };

    private _address: string = "";
    private readonly _config: Config;
    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: EthereumProvider | string, options?: Options) {
        this._config = generateConfig(options);

        switch (this.getConfig().network) {
            case "mainnet":
                this._networkData = networks.mainnet;
                break;
            case "testnet":
                this._networkData = networks.testnet;
                break;
            default:
                throw new Error(`Unsupported network field: ${this.getConfig().network}`);
        }

        const [web3, contracts] = this.updateProvider(provider);
        this._contracts = contracts;

        // Show warning when the expected network ID is different from the provider network ID
        web3.eth.net.getId()
            // tslint:disable-next-line: no-any
            .then((networkId: any) => {
                if (networkId !== this._networkData.ethNetworkId) {
                    // tslint:disable-next-line: no-console
                    console.warn(`Incorrect provider network! Your provider should be using the ${this._networkData.ethNetworkLabel} Ethereum network!`);
                }
            })
            // tslint:disable-next-line: no-console
            .catch(console.error);

        // Hack to suppress web3 MaxListenersExceededWarning
        // This should be removed when issue is resolved upstream:
        // https://github.com/ethereum/web3.js/issues/1648
        process.listeners("warning").forEach(listener => process.removeListener("warning", listener));
    }

    public fetchMarkets = (): Promise<OrderedMap<MarketPair, MarketDetails>> => fetchMarkets(this);

    // Order Methods
    public openOrder = (
        orderInputsIn: OrderInputs,
        options: TransactionOptions,
    ): Promise<SentDelayedSwap> => openOrder(this, orderInputsIn, options)

    public openOrderToSwapperD = (
        sentSwap: SentDelayedSwap,
        options: TransactionOptions,
    ): Promise<void> => openOrderToSwapperD(this, sentSwap, options)

    public openOrderToBackend = (
        sentSwap: SentDelayedSwap,
        options: TransactionOptions,
    ): Promise<SentDelayedSwap> => openOrderToBackend(this, sentSwap, options)

    public validateSwap = (
        orderInputsIn: OrderInputs,
        simpleConsole?: SimpleConsole,
    ): Promise<SentDelayedSwap> => validateSwap(this, orderInputsIn, simpleConsole)

    public normalizeSwap = (
        orderInputsIn: OrderInputs,
    ): OrderInputs => normalizeSwap(orderInputsIn)

    public cancelOrder = (orderID: OrderID, options: TransactionOptions):
        Promise<void> => cancelOrder(this, orderID, options)

    // Return details

    public fetchDarknodeFeePercent = (): Promise<BigNumber> => darknodeFees(this);
    public fetchWrappingFeePercent = (token: Token): Promise<BigNumber> => wrappingFees(this, token);
    public fetchUnwrappingFeePercent = (token: Token): Promise<BigNumber> => unwrappingFees(this, token);
    public fetchMinimumQuoteVolume = (quoteToken: Token): BigNumber => minimumQuoteVolume(quoteToken);

    // Provider / account functions
    // public getWeb3 = (): Web3 => this._web3;
    public getAddress = (): string => this._address;
    public getConfig = (): Config => this._config;

    public setAddress = (addr: string): void => {
        const address = addr === "" ? "" : new EncodedData(addr, Encodings.HEX).toHex();
        this._address = address;
    }

    public updateProvider = (provider: EthereumProvider | string): [Web3, ContractObject] => {
        // this._web3 = new Web3(provider);
        const web3 = new Web3(provider);

        // Update contract providers
        this._contracts = {
            darknodeRegistry: new web3.eth.Contract(DarknodeRegistryABI, this._networkData.contracts[0].darknodeRegistry),
        };

        return [web3, this._contracts];
    }
}

export default RenExSDK;
