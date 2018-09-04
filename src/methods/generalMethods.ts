import BigNumber from "bignumber.js";

import { BN } from "bn.js";

import { ERC20Contract } from "@Bindings/erc20";
import { ERC20, ETH_CODE, RenExTokens } from "@Contracts/contracts";
import RenExSDK, { IntInput } from "@Root/index";

export const transfer = async (sdk: RenExSDK, addr: string, token: number, valueBig: IntInput): Promise<void> => {
    sdk.contracts.renExTokens = sdk.contracts.renExTokens || await RenExTokens.deployed();

    if (token === ETH_CODE) {
        sdk.web3.eth.sendTransaction({
            from: sdk.address,
            to: addr,
            value: new BN(valueBig).mul(new BN(10).pow(new BN(18))).toNumber(),
        });
    } else {
        const tokenDetails = (await sdk.contracts.renExTokens.tokens(token));
        const tokenContract: ERC20Contract = await ERC20.at(tokenDetails.addr);
        const val = new BN(valueBig).mul(new BN(10).pow(new BN(tokenDetails.decimals)));
        tokenContract.transfer(addr, val);
    }
};
