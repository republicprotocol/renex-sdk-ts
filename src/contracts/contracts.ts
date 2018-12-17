const contract = require("./truffle-contract");

import { Provider } from "web3/providers";

// Bindings
import { DarknodeRegistryArtifact } from "./bindings/darknode_registry";
import { ERC20Artifact } from "./bindings/erc20";
import { OrderbookArtifact } from "./bindings/orderbook";
import { RenExBalancesArtifact } from "./bindings/ren_ex_balances";
import { RenExSettlementArtifact } from "./bindings/ren_ex_settlement";
import { RenExTokensArtifact } from "./bindings/ren_ex_tokens";
import { WyreArtifact } from "./bindings/wyre";

// ABIs
import DarknodeRegistryJSON from "./ABIs/DarknodeRegistry.json";
import ERC20JSON from "./ABIs/ERC20.json";
import OrderbookJSON from "./ABIs/Orderbook.json";
import RenExBalancesJSON from "./ABIs/RenExBalances.json";
import RenExSettlementJSON from "./ABIs/RenExSettlement.json";
import RenExTokensJSON from "./ABIs/RenExTokens.json";
import WyreJSON from "./ABIs/Wyre.json";

export const ETH_CODE = 1;

export const withProvider = <T extends { setProvider(provider: Provider): void; }>(provider: Provider, artifact: T): T => {
    artifact.setProvider(provider);
    return artifact;
};

export const ERC20: ERC20Artifact = contract({
    abi: ERC20JSON,
});

export const DarknodeRegistry: DarknodeRegistryArtifact = contract({
    abi: DarknodeRegistryJSON,
});

export const Orderbook: OrderbookArtifact = contract({
    abi: OrderbookJSON,
});

export const RenExSettlement: RenExSettlementArtifact = contract({
    abi: RenExSettlementJSON,
});

export const RenExBalances: RenExBalancesArtifact = contract({
    abi: RenExBalancesJSON,
});

export const RenExTokens: RenExTokensArtifact = contract({
    abi: RenExTokensJSON,
});

export const Wyre: WyreArtifact = contract({
    abi: WyreJSON,
});
