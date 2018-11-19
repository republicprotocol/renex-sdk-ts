import RenExSDK from "../index";
import { OrderedMap } from "immutable";
import { MarketDetails, MarketPair } from "../types";
export declare const MarketPairs: OrderedMap<MarketPair, MarketDetails>;
export declare function fetchMarkets(sdk: RenExSDK): Promise<MarketDetails[]>;
