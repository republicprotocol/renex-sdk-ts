// This test is used in .travis.yml to verify that we are able to import the
// module

const {
    RenExSDK
// @ts-ignore
} = require("@renex/renex");

if (typeof RenExSDK !== "function") {
    throw new Error("Unable to import SDK");
}