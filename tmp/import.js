// This test is used in .travis.yml to verify that we are able to import the
// module

const {
    RenExSDK
// @ts-ignore
} = require("@renex/renex");

const Web3 = require("web3");

if (typeof RenExSDK !== "function") {
    throw new Error("Unable to import SDK");
}

const web3 = new Web3("https://mainnet.infura.io");
const sdk = new RenExSDK(web3);


if (typeof sdk !== "object") {
    throw new Error("Unexpected SDK initialization");
}
