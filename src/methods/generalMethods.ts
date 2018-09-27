import axios from "axios";
import Web3 from "web3";

import { BN } from "bn.js";

import RenExSDK, { IntInput } from "../index";

import { ERC20Contract } from "../contracts/bindings/erc20";
import { ERC20, ETH_CODE, withProvider } from "../contracts/contracts";

export const transfer = async (sdk: RenExSDK, addr: string, token: number, valueBig: IntInput): Promise<void> => {
    const gasPrice = await sdk.getGasPrice();
    if (token === ETH_CODE) {
        sdk.web3().eth.sendTransaction({
            from: sdk.address(),
            to: addr,
            value: new BN(valueBig).mul(new BN(10).pow(new BN(18))).toNumber(),
            gasPrice
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

export const getGasPrice = async (sdk: RenExSDK): Promise<number | undefined> => {
    const maxGasPrice = 60000000000;
    try {
        const resp = await axios.get("https://ethgasstation.info/json/ethgasAPI.json");
        if (resp.data.fast) {
            const gasPrice = resp.data.fast * Math.pow(10, 8);
            return gasPrice > maxGasPrice ? maxGasPrice : gasPrice;
        }
        throw new Error("cannot retrieve gas price from ethgasstation");
    } catch (error) {
        console.error(error);
        try {
            return await sdk.web3().eth.getGasPrice() * 1.1;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
};
