import * as contract from "truffle-contract";

import Web3 from "web3";

import { Provider } from "web3/types";

// Bindings
import { DarknodeRegistryArtifact } from "@Bindings/darknode_registry";
import { ERC20Artifact } from "@Bindings/erc20";
import { OrderbookArtifact } from "@Bindings/orderbook";
import { RenExAtomicInfoArtifact } from "@Bindings/ren_ex_atomic_info";
import { RenExBalancesArtifact } from "@Bindings/ren_ex_balances";
import { RenExSettlementArtifact } from "@Bindings/ren_ex_settlement";
import { RenExTokensArtifact } from "@Bindings/ren_ex_tokens";

// ABIs (Do not use any tsconfig paths here)
import DarknodeRegistryJSON from "./ABIs/DarknodeRegistry.json";
import ERC20JSON from "./ABIs/ERC20.json";
import OrderbookJSON from "./ABIs/Orderbook.json";
import RenExAtomicInfoJSON from "./ABIs/RenExAtomicInfo.json";
import RenExBalancesJSON from "./ABIs/RenExBalances.json";
import RenExSettlementJSON from "./ABIs/RenExSettlement.json";
import RenExTokensJSON from "./ABIs/RenExTokens.json";

export const ETH_CODE = 1;

export const withProvider = <T extends { setProvider(provider: Provider): void; }>(web3: Web3, artifact: T): T => {
    artifact.setProvider(web3.currentProvider);
    return artifact;
};

export const ERC20: ERC20Artifact = contract.default({
    abi: ERC20JSON,
});

export const DarknodeRegistry: DarknodeRegistryArtifact = contract.default({
    abi: DarknodeRegistryJSON,
});

export const Orderbook: OrderbookArtifact = contract.default({
    abi: OrderbookJSON,
});

export const RenExSettlement: RenExSettlementArtifact = contract.default({
    abi: RenExSettlementJSON,
});

export const RenExBalances: RenExBalancesArtifact = contract.default({
    abi: RenExBalancesJSON,
});

export const RenExTokens: RenExTokensArtifact = contract.default({
    abi: RenExTokensJSON,
});

export const RenExAtomicInfo: RenExAtomicInfoArtifact = contract.default({
    abi: RenExAtomicInfoJSON,
});