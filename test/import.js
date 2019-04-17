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

const sdk = new RenExSDK("https://mainnet.infura.io");

console.log(typeof sdk);