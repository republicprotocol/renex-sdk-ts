import { BN } from "bn.js";

import RenExSDK, { IntInput } from "../index";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, ETH_CODE, withProvider } from "../contracts/contracts";
import { NetworkData } from "../lib/network";

export const transfer = async (sdk: RenExSDK, addr: string, token: number, valueBig: IntInput): Promise<void> => {
    if (token === ETH_CODE) {
        sdk.web3.eth.sendTransaction({
            from: sdk.address,
            to: addr,
            value: new BN(valueBig).mul(new BN(10).pow(new BN(18))).toNumber(),
        });
    } else {
        const tokenDetails = (await sdk.contracts.renExTokens.tokens(token));
        let tokenContract: ERC20Contract;
        if (!sdk.contracts.erc20.has(token)) {
            tokenContract = new (withProvider(sdk.web3, ERC20))(tokenDetails.addr);
            sdk.contracts.erc20.set(token, tokenContract);
        } else {
            tokenContract = sdk.contracts.erc20.get(token);
        }
        const val = new BN(valueBig).mul(new BN(10).pow(new BN(tokenDetails.decimals)));
        await tokenContract.transfer(addr, val);
    }
};
