const contract = require("./truffle-contract/index.js");
// import * as contract from "truffle-contract";

import Web3 from "web3";
import ProviderEngine from "web3-provider-engine";
import FetchSubprovider from "web3-provider-engine/subproviders/fetch";

import { Provider } from "web3/types";

// Bindings
import { DarknodeRegistryArtifact } from "./bindings/darknode_registry";
import { ERC20Artifact } from "./bindings/erc20";
import { OrderbookArtifact } from "./bindings/orderbook";
import { RenExAtomicInfoArtifact } from "./bindings/ren_ex_atomic_info";
import { RenExBalancesArtifact } from "./bindings/ren_ex_balances";
import { RenExSettlementArtifact } from "./bindings/ren_ex_settlement";
import { RenExTokensArtifact } from "./bindings/ren_ex_tokens";
import { WyreArtifact } from "./bindings/wyre";

// ABIs
import DarknodeRegistryJSON from "./ABIs/DarknodeRegistry.json";
import ERC20JSON from "./ABIs/ERC20.json";
import OrderbookJSON from "./ABIs/Orderbook.json";
import RenExAtomicInfoJSON from "./ABIs/RenExAtomicInfo.json";
import RenExBalancesJSON from "./ABIs/RenExBalances.json";
import RenExSettlementJSON from "./ABIs/RenExSettlement.json";
import RenExTokensJSON from "./ABIs/RenExTokens.json";
import WyreJSON from "./ABIs/Wyre.json";

export const ETH_CODE = 1;

export const withKovanProvider = <T extends { setProvider(provider: Provider): void; }>(artifact: T): T => {
    const engine = new ProviderEngine();
    engine.addProvider(new FetchSubprovider({ rpcUrl: "https://kovan.infura.io/8ZCgtqu4tkIIRHh9hFZj" }));
    engine.start();
    artifact.setProvider(engine);
    return artifact;
};

export const withProvider = <T extends { setProvider(provider: Provider): void; }>(web3: Web3, artifact: T): T => {
    artifact.setProvider(web3.currentProvider);
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

export const RenExAtomicInfo: RenExAtomicInfoArtifact = contract({
    abi: RenExAtomicInfoJSON,
});

export const Wyre: WyreArtifact = contract({
    abi: WyreJSON,
});
