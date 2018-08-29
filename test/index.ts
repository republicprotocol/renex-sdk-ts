import RenExSDK from "../src/index";

import Web3 from "web3";

const web3 = new Web3();

const sdk = new RenExSDK(web3.currentProvider);

console.log(sdk);