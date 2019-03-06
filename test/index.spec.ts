import BigNumber from "bignumber.js";
import chai, { expect } from "chai";
import HDWalletProvider from "truffle-hdwallet-provider";
import Web3 from "web3";
import NonceSubprovider from "web3-provider-engine/subproviders/nonce-tracker";

import RenExSDK, { BalanceDetails, NetworkData, NumberInput, OrderStatus, TokenCode, TransactionStatus } from "../src/index";
import { networks } from "../src/lib/network";

import dotenv from "dotenv";
dotenv.load();

const MNEMONIC = process.env.MNEMONIC;
const NETWORK: NetworkData = networks.testnet;
const INFURA_URL = `${NETWORK.infura}/${process.env.INFURA_KEY}`;

chai.should();

// tslint:disable:no-unused-expression

describe("SDK methods", () => {
    // tslint:disable-next-line:no-any
    let provider: any;
    let sdk: RenExSDK;
    let web3: Web3;
    let accounts: string[];
    let mainAccount: string;

    before(async () => {
        if (!MNEMONIC) {
            throw new Error("MNEMONIC environment variable has not been set");
        }

        // Initialize the provider and set our own nonce tracker
        provider = new HDWalletProvider(MNEMONIC, INFURA_URL, 0, 10);
        const nonceTracker = new NonceSubprovider();
        provider.engine._providers.unshift(nonceTracker);
        nonceTracker.setEngine(provider.engine);

        // Initialize the SDK
        sdk = new RenExSDK(provider, {
            network: "testnet",
            storageProvider: "none",
            autoNormalizeOrders: true,
        });
        web3 = new Web3(provider);

        // Set up the SDK to use the main account
        accounts = await web3.eth.getAccounts();
        mainAccount = accounts[0];
        sdk.setAddress(mainAccount);
    });

    after(() => {
        if (!MNEMONIC) {
            // Already thrown in beforeAll.
            return;
        }

        provider.engine.stop();
    });

    it("should return the correct SDK address", () => {
        sdk.getAddress().should.eq(mainAccount);
    });

    it("should fetch balances", async () => {
        const balances = await sdk.fetchBalances(["ETH", "REN"]);
        const ethBalances = await expectPositiveBalance(balances, "ETH");
        await expectPositiveBalance(balances, "REN");
    });

    it("should fetch supported tokens", async () => {
        const tokens = await sdk.fetchSupportedTokens();
        tokens.should.not.be.empty;
        tokens.includes("ETH").should.be.true;
        tokens.includes("REN").should.be.true;
        // BTC should not be in supported tokens
        tokens.includes("BTC").should.be.false;
    });

    it("should fetch supported atomic tokens", async () => {
        const atomicTokens = await sdk.fetchSupportedSwapperDTokens();
        atomicTokens.should.not.be.empty;
        atomicTokens.includes("ETH").should.be.true;
        atomicTokens.includes("BTC").should.be.true;
    });

    // describe("SDK deposit methods", async () => {
    //     it("should successfully deposit ETH", async () => {
    //         await expectTokenDeposit(sdk, "ETH", 1.1);
    //     });

    //     it("should successfully deposit REN", async () => {
    //         await expectTokenDeposit(sdk, "REN", 50000);
    //     });
    // });

    // describe("SDK withdraw methods", async () => {
    //     it("should successfully withdraw ETH", async () => {
    //         await expectTokenWithdraw(sdk, "ETH", 1.1);
    //     });

    //     it("should successfully withdraw REN", async () => {
    //         await expectTokenWithdraw(sdk, "REN", 50000);
    //     });
    // });

    describe("SDK order methods", async () => {
        let orderID;
        // before(async () => {
        //     await expectTokenDeposit(sdk, "ETH", 1.1);
        // });

        // after(async () => {
        //     await expectTokenWithdraw(sdk, "ETH", 1.1);
        // });

        it("should successfully open an order", async () => {
            orderID = await expectOpenOrder(sdk);
        });

        it("should successfully cancel an order", async () => {
            await expectCancelOrder(sdk, orderID);
        });
    });

});

// tslint:disable-next-line:no-any
async function awaitPromiseResponse(prom: () => Promise<any>, expected: any): Promise<void> {
    let ret;
    while (true) {
        ret = await prom();
        if (ret === expected) {
            return;
        }
        await sleep(1000);
    }
}

async function expectCancelOrder(sdk: RenExSDK, orderID: string): Promise<string> {
    await sdk.cancelOrder(orderID);
    await awaitPromiseResponse(() => {
        return sdk.fetchOrderStatus(orderID);
    }, OrderStatus.CANCELED);
    const orderStatus = await sdk.fetchOrderStatus(orderID);
    orderStatus.should.be.equal(OrderStatus.CANCELED);
    return orderID;
}

async function expectOpenOrder(sdk: RenExSDK): Promise<string> {
    const orderResponse = await sdk.openOrder({
        symbol: "REN/ETH",
        side: "buy",         // buying REN for ETH
        price: 0.0001395678,  // ETH for 1 REN
        volume: 7234,          // REN
    });
    const orderID = orderResponse.traderOrder.id;
    await awaitPromiseResponse(() => {
        return sdk.fetchOrderStatus(orderID);
    }, OrderStatus.OPEN);
    const orderStatus = await sdk.fetchOrderStatus(orderID);
    orderStatus.should.be.equal(OrderStatus.OPEN);
    return orderID;
}

// async function expectTokenDeposit(sdk: RenExSDK, token: TokenCode, amount: NumberInput): Promise<void> {
//     const initialBalance = await expectFetchTokenBalance(sdk, token);
//     const depositResponse = await sdk.deposit(amount, token);
//     await awaitPromiseResponse(() => {
//         return sdk.fetchBalanceActionStatus(depositResponse.balanceAction.txHash);
//     }, TransactionStatus.Done);
//     const finalBalance = await expectFetchTokenBalance(sdk, token);
//     finalBalance.free.should.deep.eq(initialBalance.free.plus(amount));
// }

// async function expectTokenWithdraw(sdk: RenExSDK, token: TokenCode, amount: NumberInput): Promise<void> {
//     const initialBalance = await expectFetchTokenBalance(sdk, token);
//     const withdrawResponse = await sdk.withdraw(amount, token);
//     await awaitPromiseResponse(() => {
//         return sdk.fetchBalanceActionStatus(withdrawResponse.balanceAction.txHash);
//     }, TransactionStatus.Done);
//     const finalBalance = await expectFetchTokenBalance(sdk, token);
//     finalBalance.free.should.deep.eq(initialBalance.free.minus(amount));
// }

// async function expectFetchTokenBalance(sdk: RenExSDK, token: TokenCode): Promise<BalanceDetails> {
//     const balances = await sdk.fetchBalances([token]).then(bal => bal.get(token));
//     expect(balances).to.not.be.undefined;
//     return balances;
// }

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function expectPositiveBalance(balances: Map<TokenCode, BalanceDetails>, token: TokenCode): Promise<BalanceDetails | void> {
    const bal = balances.get(token);
    expect(bal).to.not.be.undefined;
    if (!bal) {
        return;
    }
    expect(bal.free).to.not.be.null;
    bal.free.gte(new BigNumber(0)).should.be.true;
    expect(bal.used).to.not.be.null;
    bal.used.gte(new BigNumber(0)).should.be.true;
    expect(bal.nondeposited).to.not.be.null;
    bal.nondeposited.gte(new BigNumber(0)).should.be.true;
    return bal;
}
