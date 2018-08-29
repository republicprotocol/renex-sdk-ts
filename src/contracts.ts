import { NetworkData } from "./network";

import * as contract from "truffle-contract";
import { RenExSettlementArtifact } from "./bindings/ren_ex_settlement";
import { OrderbookArtifact } from "./bindings/orderbook";
import { DarknodeRegistryArtifact } from "./bindings/darknode_registry";
import { RenExBalancesArtifact } from "./bindings/ren_ex_balances";
import { RenExAtomicInfoArtifact } from "./bindings/ren_ex_atomic_info";

export const ERC20 = contract.default({
    abi: require("./ABIs/ERC20.json"),
    address: ""
});

export const DarknodeRegistry: DarknodeRegistryArtifact = contract.default({
    abi: require("./ABIs/DarknodeRegistry.json"),
    address: NetworkData.contracts[0].darknodeRegistry,
});

export const Orderbook: OrderbookArtifact = contract.default({
    abi: require("./ABIs/Orderbook.json"),
    address: NetworkData.contracts[0].orderbook,
});

export const RenExSettlement: RenExSettlementArtifact = contract.default({
    abi: require("./ABIs/RenExSettlement.json"),
    address: NetworkData.contracts[0].renExSettlement,
});

export const RenExBalances: RenExBalancesArtifact = contract.default({
    abi: require("./ABIs/RenExBalances.json"),
    address: NetworkData.contracts[0].renExBalances,
});

export const RenExAtomicInfo: RenExAtomicInfoArtifact = contract.default({
    abi: require("./ABIs/RenExAtomicInfo.json"),
    address: "",
});
