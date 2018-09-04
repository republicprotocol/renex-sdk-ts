const RenExSDK = require("../lib/index");

const Web3 = require("web3");

const web3 = new Web3();

const sdk = new RenExSDK(web3.currentProvider, "");

console.log(sdk);