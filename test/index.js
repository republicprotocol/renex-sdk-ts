const {
    RenExSDK
} = require("../dist/index");

const Web3 = require("web3");

const sdk = new RenExSDK("https://kovan.infura.io/", {
    network: "testnet"
});

sdk.swapperD.getWrappingFees("WBTC").then(console.log).catch(console.error);