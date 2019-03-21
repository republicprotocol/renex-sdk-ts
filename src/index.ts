import BigNumber from "bignumber.js";
import Web3 from "web3";

import Contract from "web3/eth/contract";

import { OrderedMap } from "immutable";
import { Provider } from "web3/providers";

import { errors } from "./errors";
import { generateConfig } from "./lib/config";
import { normalizePrice, normalizeVolume, toOriginalType } from "./lib/conversion";
import { EncodedData, Encodings } from "./lib/encodedData";
import { fetchMarkets } from "./lib/market";
import { NetworkData, networks } from "./lib/network";
import { MarketPair, Token, Tokens } from "./lib/tokens";
import { ReturnedSwap, SentDelayedSwap, SentNonDelayedSwap } from "./lib/types/swapObject";
import { cancelOrder } from "./methods/cancelOrder";
import { darknodeFees, minimumQuoteVolume, openOrder, validateSwap } from "./methods/openOrder";
import {
    currentSwapperDConnectionStatus, getSwapperID, getSwapperVersion,
    refreshSwapperDConnectionStatus, resetSwapperDConnection,
    swapperDAddresses, swapperDBalances, swapperDConnected, swapperDSwaps,
} from "./methods/swapperD";
import { getWrappingFees, unwrap, unwrappingFees, wrap, WrapFees, WrapFeesMap, wrappingFees } from "./methods/wrapToken";
import {
    Config, MarketDetails, NumberInput, Options, OrderID,
    OrderInputs, SwapperDBalanceDetails, SwapperDConnectionStatus,
    TokenDetails, TransactionOptions,
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

    private _web3: Web3;
    private _address: string = "";
    private _config: Config;
    /**
     * Creates an instance of RenExSDK.
     * @param {Provider} provider
     * @memberof RenExSDK
     */
    constructor(provider: Provider, options?: Options, mainnetProvider?: Provider) {
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

        [this._web3, this._contracts] = this.updateProvider(provider, mainnetProvider);

        // Show warning when the expected network ID is different from the provider network ID
        this._web3.eth.net.getId()
            // tslint:disable-next-line: no-any
            .then((networkId: any) => {
                if (networkId !== this._networkData.ethNetworkId) {
                    console.warn(`Incorrect provider network! Your provider should be using the ${this._networkData.ethNetworkLabel} Ethereum network!`);
                }
            })
            .catch(console.error);

        // Hack to suppress web3 MaxListenersExceededWarning
        // This should be removed when issue is resolved upstream:
        // https://github.com/ethereum/web3.js/issues/1648
        process.listeners("warning").forEach(listener => process.removeListener("warning", listener));
    }

    public fetchMarkets = (): Promise<OrderedMap<MarketPair, MarketDetails>> => fetchMarkets(this);

    // Order Methods
    public openOrder = (
        orderInputsIn: OrderInputs | undefined,
        options: TransactionOptions,
        sentSwapIn?: SentDelayedSwap,
    ): Promise<SentDelayedSwap> => openOrder(this, orderInputsIn, options, sentSwapIn)

    public validateSwap = (
        orderInputsIn: OrderInputs,
        options?: TransactionOptions,
    ): Promise<SentDelayedSwap> => validateSwap(this, orderInputsIn, options)

    public cancelOrder = (orderID: OrderID, options: TransactionOptions):
        Promise<void> => cancelOrder(this, orderID, options)

    // Return details

    public fetchDarknodeFeePercent = (): Promise<BigNumber> => darknodeFees(this);
    public fetchWrappingFeePercent = (token: Token): Promise<BigNumber> => wrappingFees(this, token);
    public fetchUnwrappingFeePercent = (token: Token): Promise<BigNumber> => unwrappingFees(this, token);
    public fetchMininimumQuoteVolume = (quoteToken: Token): BigNumber => minimumQuoteVolume(quoteToken);

    // Provider / account functions
    public getWeb3 = (): Web3 => this._web3;
    public getAddress = (): string => this._address;
    public getConfig = (): Config => this._config;

    public setAddress = (addr: string): void => {
        const address = addr === "" ? "" : new EncodedData(addr, Encodings.HEX).toHex();
        this._address = address;
    }

    public updateProvider = (provider: Provider, mainnetProvider?: Provider): [Web3, ContractObject] => {
        this._web3 = new Web3(provider);
        const mainnetWeb3 = mainnetProvider ? new Web3(mainnetProvider) : this._web3;

        console.log(mainnetProvider);

        // Update contract providers
        this._contracts = {
            darknodeRegistry: new mainnetWeb3.eth.Contract(DarknodeRegistryABI, this._networkData.contracts[0].darknodeRegistry),
        };

        return [this._web3, this._contracts];
    }
}

export default RenExSDK;
