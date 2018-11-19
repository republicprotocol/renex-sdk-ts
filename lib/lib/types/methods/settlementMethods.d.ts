import RenExSDK from "../index";
import { MatchDetails, OrderStatus } from "../types";
export declare const status: (sdk: RenExSDK, orderID64: string) => Promise<OrderStatus>;
export declare const matchDetails: (sdk: RenExSDK, orderID64: string) => Promise<MatchDetails>;
