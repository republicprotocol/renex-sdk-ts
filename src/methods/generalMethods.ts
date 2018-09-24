import { BN } from "bn.js";

import RenExSDK, { IntInput } from "../index";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, ETH_CODE, withProvider } from "../contracts/contracts";

export const transfer = async (sdk: RenExSDK, addr: string, token: number, valueBig: IntInput): Promise<void> => {
    if (token === ETH_CODE) {
        sdk.web3().eth.sendTransaction({
            from: sdk.address(),
            to: addr,
            value: new BN(valueBig).mul(new BN(10).pow(new BN(18))).toNumber(),
        });
    } else {
        const tokenDetails = await sdk.tokenDetails(token);
        let tokenContract: ERC20Contract | undefined = sdk._contracts.erc20.get(token);
        if (!tokenContract) {
            tokenContract = new (withProvider(sdk.web3().currentProvider, ERC20))(tokenDetails.address);
            sdk._contracts.erc20.set(token, tokenContract);
        }
        const val = new BN(valueBig).mul(new BN(10).pow(new BN(tokenDetails.decimals)));
        await tokenContract.transfer(addr, val);
    }
};
