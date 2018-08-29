import { NetworkData } from "./network";

import contract from "truffle-contract";
import { RenExSettlementArtifact } from "./bindings/ren_ex_settlement";
import { OrderbookArtifact } from "./bindings/orderbook";
import { DarknodeRegistryArtifact } from "./bindings/darknode_registry";
import { RenExBalancesArtifact } from "./bindings/ren_ex_balances";
import { RenExAtomicInfoArtifact } from "./bindings/ren_ex_atomic_info";

export const ERC20 = contract({
    abi: require("./ABIs/ERC20.json"),
    address: ""
});

export const DarknodeRegistry: DarknodeRegistryArtifact = contract({
    abi: require("./ABIs/DarknodeRegistry.json"),
    address: NetworkData.contracts[0].darknodeRegistry,
});

export const Orderbook: OrderbookArtifact = contract({
    abi: require("./ABIs/Orderbook.json"),
    address: NetworkData.contracts[0].orderbook,
});

export const RenExSettlement: RenExSettlementArtifact = contract({
    abi: require("./ABIs/RenExSettlement.json"),
    address: NetworkData.contracts[0].renExSettlement,
});

export const RenExBalances: RenExBalancesArtifact = contract({
    abi: require("./ABIs/RenExBalances.json"),
    address: NetworkData.contracts[0].renExBalances,
});

export const RenExAtomicInfo: RenExAtomicInfoArtifact = contract({
    abi: require("./ABIs/RenExAtomicInfo.json"),
    address: "",
});
