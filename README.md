# Official RenEx SDK

The official Javascript SDK for interacting with [RenEx](https://ren.exchange) -- the world's first decentralized dark pool exchange.

## Links

* [Official SDK Docs](https://republicprotocol.github.io/renex-sdk-docs)
* [Cloneable Examples](https://github.com/republicprotocol/renex-sdk-examples-js)

## Installation

Add the RenExSDK using NPM

```bash
npm install --save @renex/renex
```

Add the RenExSDK using Yarn

```bash
yarn add @renex/renex
```

## Importing the SDK

Importing using the require syntax

```javascript
var { RenExSDK } = require("@renex/renex");
```

Importing using the ES6 syntax

```javascript
import { RenExSDK } from "@renex/renex";
```

## Usage

Pass in a provider object to instantiate the SDK and set the address.

```javascript
var provider = window.web3.currentProvider;
var sdk = new RenExSDK(provider);
sdk.setAddress(window.web3.eth.defaultAccount);
```

For information on SDK usage, check out the [official SDK Docs](https://republicprotocol.github.io/renex-sdk-docs) or clone the [examples repository](https://github.com/republicprotocol/renex-sdk-examples-js).

## For Developers

### To build:

```bash
npm run watch
# or
npm run build:dev
```

### To run tests:

You'll need to create a `.env` file which contains the following exported variables:

```bash
export MNEMONIC="some mnemonic here"
export INFURA_KEY="your infura api key"
```

Then just run the following command to execute the tests. Make sure there is sufficient Kovan ETH in the linked account before running tests.

```bash
npm run test
```

### To update the typescript bindings:

In order to update the bindings in `src/contracts/bindings`, you need to clone [`renex-sol`](https://github.com/republicprotocol/renex-sol) and run:

```bash
cd renex-sol
npm run bindings
cd ../
cp renex-sol/test-ts/bindings/*.ts src/contracts/bindings
```

