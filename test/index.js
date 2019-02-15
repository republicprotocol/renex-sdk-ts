const {
    RenExSDK
} = require("../dist/index");

const Web3 = require("web3");

const web3 = new Web3("https://kovan.infura.io/");

const sdk = new RenExSDK(web3.currentProvider, {
    network: "testnet"
});

sdk.swapperd.getWrappingFees("WBTC").then(console.log).catch(console.error);