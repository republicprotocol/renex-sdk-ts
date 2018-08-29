import { NetworkData } from "./network";

// TODO: Generate production key
export const INFURA_KEY = "8ZCgtqu4tkIIRHh9hFZj";

// Contracts
interface ContractDetails {
    ABI: any[];
    address: string;
}

export const ERC20Contract: ContractDetails = {
    ABI: require("./ABIs/ERC20.json"),
    address: ""
};

export const DarknodeRegistryContract: ContractDetails = {
    ABI: require("./ABIs/DarknodeRegistry.json"),
    address: NetworkData.contracts[0].darknodeRegistry,
};

export const OrderbookContract: ContractDetails = {
    ABI: require("./ABIs/Orderbook.json"),
    address: NetworkData.contracts[0].orderbook,
};

export const RenExSettlementContract: ContractDetails = {
    ABI: require("./ABIs/RenExSettlement.json"),
    address: NetworkData.contracts[0].renExSettlement,
};

export const RenExBalancesContract: ContractDetails = {
    ABI: require("./ABIs/RenExBalances.json"),
    address: NetworkData.contracts[0].renExBalances,
};

export const AtomicInfoContract: ContractDetails = {
    ABI: require("./ABIs/AtomicInfo.json"),
    address: "",
};
