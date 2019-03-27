import dotenv from "dotenv";
dotenv.load();

import Web3 from "web3";
// import Axios from "axios";
// import MockAdapter from "axios-mock-adapter/types";
// import NodeRSA from "node-rsa";

import BN from "bn.js";
import { randomBytes } from "crypto";
// import { Map } from "immutable";

// Contract bindings
import DarknodeRegistryABI from "../../src/ABIs/DarknodeRegistry.json";

import { NetworkData, networks } from "../../src/lib/network";

import * as renexNode from "../../src/lib/renexNode";
import * as shamir from "../../src/lib/shamir";
// import { utils } from "web3";

// import { Pair } from "@Library/market";
// import { NetworkData } from "@Library/network";
// import { MockSignature64, MockWallet } from "@Library/wallets/mockWallet";
// import { Wallet, WalletDetail } from "@Library/wallets/wallet";
// import { DarknodeRegistryContractType } from "../types";
// import { TransactionObject } from "web3/types";

// Define window.crypto.getRandomValues() for use within test suite.
Object.defineProperty(global, "crypto", {
    value: {
        getRandomValues: (arr: Int32Array) => {
            arr.set(randomBytes(arr.length), 0);
        }
    },
});

// // Mock DNR contract
// // tslint:disable:no-object-literal-type-assertion
// const darknodeRegistryContract: DarknodeRegistryContractType = {
//     options: null as any,
//     deploy: null as any,
//     events: null as any,
//     getPastEvents: null as any,
//     setProvider: null as any,
//     methods: {
//         getDarknodes: () => {
//             return {
//                 call: () => {
//                     return new Promise(resolve => {
//                         resolve(
//                             [
//                                 "0x27e721f265279139b47d08e62be195b011c96def",
//                                 "0xe848d1407690945d8d661bd07d7bea7b6873c5d1",
//                                 "0x28101662bc0e7d2e0bf4c4bcc97b018cb924ba04",
//                                 "0xba03a9343e4ea5084e630754d2cd7c7f2f4010ce",
//                                 "0xda5b66d98ed81ca89d1c40efa7b7e8731b9acaa8",
//                                 "0x5c38d294242eddaff0ddfb0a46f618861e7a31ac",
//                                 "0x861f8fd02fa9b3ea1e19165c2ca2da230e6befef",
//                                 "0x0100976af3df0739309c4a95fe2bff06baa36328",
//                                 "0xa29add606ef933dd22f5fc32f580566907b21166",
//                                 "0xd3e0d099754209083d4ded17b5596247ea1789fe",
//                                 "0xa583eca96fae4e8d4207f5be44251e6c24e56d4d",
//                                 "0xb5115b0db6976ff96e7dd8d148e3cc5760312bf6",
//                                 "0xc10592b3aa69e2168b08f2ac8f3eca5204a2a47f",
//                                 "0x74ef5c1b29e61b49b2ea643e04246713ce5cecac",
//                                 "0xfc8f5d416d8b4d3596892c298133e57888f96df0"
//                             ]
//                         );
//                     });
//                 }
//             } as TransactionObject<string[]>;
//         },
//         minimumPodSize: () => {
//             return {
//                 call: () => {
//                     return new Promise(resolve => {
//                         resolve("5");
//                     });
//                 }
//             } as TransactionObject<string>;
//         },
//         currentEpoch: () => {
//             return {
//                 call: () => {
//                     return new Promise(resolve => {
//                         resolve(
//                             { 0: "68328971127810062361648233914791405200144039983296018663944250984843984173103", 1: "1527464060" }
//                         );
//                     });
//                 }
//             } as TransactionObject<{ 0: string, 1: string }>;
//         },
//         isRegistered: (darknode: string) => {
//             return {
//                 call: () => {
//                     return new Promise(resolve => {
//                         resolve(true);
//                     });
//                 }
//             } as TransactionObject<boolean>;
//         },
//         getPublicKey: (darknode: string) => {
//             return {
//                 call: () => {
//                     return new Promise(resolve => {
//                         // tslint:disable-next-line:max-line-length
//                         resolve("0x0000000000010001dfc1295886cb3764b447abb7fe295111ea16bc08374359e3622076c3df9019c7f4a61409e4bfe1ac312322e8fee136fe93f4dc05c751e6099f5d274b7f43b9713a98103387b0c3a06b8f02af9c54469e47cb6002c4fcd4ff97a1a85c43ec50b1eec81cabfa2dc794f7a7a3e900835f7908c074b0aa28cc94cd7e4f7b8e46634dc07ccd96c507a9d6790a9e9b5d87fc900982b05f3369a076a39782c68a011fe267d449de9fe9c76cd10fc0a91ef8b720fd6df656de7fac3a34b5c4b2cf306dade37aaddaa0be98bebfd0edc0872948a227e0a25ad5d894a080c821bc9deeb0056ddd6400ad54313226e42f84ffb349c0b187235b37a8618288640a64ee76b59b");
//                     });
//                 }
//             } as TransactionObject<string>;
//         }
//     }
// };

// // Axios mock adapter
// const mock = new MockAdapter(Axios);

// const WalletDetails: Map<Wallet, WalletDetail> = Map<Wallet, WalletDetail>()
//     .set(Wallet.MockWallet, MockWallet);

// // Mock wallet
// const wallet = Wallet.MockWallet;

// test("it should open an order", async () => {
//     const walletDetails = WalletDetails.get(wallet, undefined);
//     const web3 = await walletDetails.getWeb3();
//     expect(web3).not.toBeNull();
//     const address = await walletDetails.selectAccount(web3);
//     expect(address).not.toBeNull();
//     const openedOrder = await ingress.openOrder(web3, walletDetails, address, order);
//     expect(openedOrder.signature.length).toBeGreaterThan(0);
//     expect(openedOrder.id.length).toBeGreaterThan(0);
//     expect(openedOrder.expiry).toEqual(order.expiry);
// });

// test("it should resolve for successful post responses", async () => {
//     mock.onPost(`${NetworkData.ingress}/orders`).reply(200, {});
//     const walletDetails = WalletDetails.get(wallet, undefined);
//     const web3 = await walletDetails.getWeb3();
//     const orderFragments = new ingress.OrderFragments({
//         signature: order.signature,
//         orderFragmentMappings: [await ingress.buildOrderFragmentsForPods(web3, darknodeRegistryContract, order)]
//     });
//     await ingress.submitOrderFragments(orderFragments).catch(e => expect(e).not.toBeDefined());
// });

// test("it should error for unsuccessful post responses", async () => {
//     mock.onPost(`${NetworkData.ingress}/orders`).reply(500, {});
//     const walletDetails = WalletDetails.get(wallet, undefined);
//     const web3 = await walletDetails.getWeb3();
//     const orderFragments = new ingress.OrderFragments({
//         signature: order.signature,
//         orderFragmentMappings: [await ingress.buildOrderFragmentsForPods(web3, darknodeRegistryContract, order)]
//     });
//     await ingress.submitOrderFragments(orderFragments).catch(e => expect(e).toBeDefined());
// });

// test("it should resolve for successful delete responses", async () => {
//     mock.onDelete(`${NetworkData.ingress}/orders?id=&signature=${encodeURIComponent(MockSignature64)}`).reply(200, {});
//     const walletDetails = WalletDetails.get(wallet, undefined);
//     const web3 = await walletDetails.getWeb3();
//     const address = await walletDetails.selectAccount(web3);
//     await ingress.cancelOrder(web3, walletDetails, address, order.id).catch(e => expect(e).not.toBeDefined());
// });

// test("it should error for unsuccessful delete responses", async () => {
//     mock.onDelete(`${NetworkData.ingress}/orders?id=&signature=${encodeURIComponent(MockSignature64)}`).reply(500, {});
//     const walletDetails = WalletDetails.get(wallet, undefined);
//     const web3 = await walletDetails.getWeb3();
//     const address = await walletDetails.selectAccount(web3);
//     await ingress.cancelOrder(web3, walletDetails, address, order.id).catch(e => expect(e).toBeDefined());
// });

// test("it should correctly split order into fragments", async () => {
//     const walletDetails = WalletDetails.get(wallet, undefined);
//     const web3 = await walletDetails.getWeb3();
//     expect(web3).toBeDefined();
//     const fragments = await ingress.buildOrderFragmentsForPods(web3, darknodeRegistryContract, order);
//     expect(fragments.size).toEqual(3);
//     const fragmentSet = fragments.toList().get(0).toJS();
//     for (const fragment of fragmentSet) {
//         expect(fragment.orderType).toEqual(order.type);
//         expect(fragment.orderParity).toEqual(order.parity);
//         expect(fragment.orderExpiry).toEqual(order.expiry);
//     }
//     expect(fragments.toList().get(0).size).toEqual(5);
//     expect(fragments.toList().get(1).size).toEqual(5);
//     expect(fragments.toList().get(2).size).toEqual(5);
// });

// test("it should correctly generate an order ID", async () => {
//     const walletDetails = WalletDetails.get(wallet, undefined);
//     const web3 = await walletDetails.getWeb3();
//     const fixedOrder = new ingress.Order({
//         type: ingress.OrderType.LIMIT,
//         parity: ingress.OrderParity.BUY,
//         expiry: 1517652000,
//         tokens: Pair.ETHREN,
//         price: new ingress.Tuple({ c: 1, q: 2 }),
//         volume: new ingress.Tuple({ c: 1, q: 3 }),
//         minimumVolume: new ingress.Tuple({ c: 1, q: 3 }),
//         nonce: new BN(10),
//     });
//     const id = ingress.getOrderID(web3, fixedOrder);
//     // If this changes, the Go implementation may need to be updated as well
//     expect(id).toEqual("0xa2cd3f1d4e22af998905cebc124a202b7fa388eff22a20e71206b3e9a5f261d8");
// });

// test('can hash for arbitrary nonces', async () => {
//     const web3 = await WalletDetails.get(wallet).getWeb3();
//     const fixedOrder = new ingress.Order({
//         type: ingress.OrderType.LIMIT,
//         parity: ingress.OrderParity.BUY,
//         expiry: 1517652000,
//         tokens: Pair.ETHREN,
//         price: new ingress.Tuple({ c: 1, q: 2 }),
//         volume: new ingress.Tuple({ c: 1, q: 3 }),
//         minimumVolume: new ingress.Tuple({ c: 1, q: 3 }),
//         nonce: new BN(160287798389754777401),
//     });
//     ingress.getOrderID(web3, fixedOrder);
// })

// // Mock order
// const order = new renexNode.Order({
//     type: renexNode.OrderType.LIMIT,
//     parity: renexNode.OrderParity.BUY,
//     expiry: Math.round((new Date()).getTime() / 1000),
//     tokens: Pair.ETHREN,
//     price: new renexNode.Tuple({ c: 200, q: 40 }),
//     volume: new renexNode.Tuple({ c: 500, q: 14 }),
//     minimumVolume: new renexNode.Tuple({ c: 500, q: 14 }),
// });

describe("encryption", () => {
    const sameKeys = [
        {
            ssh: "0x000000077373682d727361000000030100010000010100ad414c948e5b7b09578df1bcdc18c0a62aa4215a6b71450ea879d428594fe3d4fc11e6b2b4f793ee6ecd9372f2b0eec70eb073570fb8620af3ef5176d718f485fc03bf7f7e44dde90b54e649b0cb8b57992656903c1d4d71a43e062532186fc34ad9c45926750d87545b9b71bf28d639a4c53dd4f68f801dd7d4cf1d026b40dd8301992d0253380987e996e5469701b2191cbdceb382edd2fe242caca1b32cc7dcf4aac85e121ac26ed086446be98fdd5a60cc4b58461ba067c6b8683307f8d0e18809df16d10abf26fe2cc8b06a0189f665ff0454bd967dfee1877fee3270dc71226530e989a53a7a92d19c5bb71c474f2cd9b90b74ecd447b2ebaaac507cdb",
            hex: "0x0000000000010001ad414c948e5b7b09578df1bcdc18c0a62aa4215a6b71450ea879d428594fe3d4fc11e6b2b4f793ee6ecd9372f2b0eec70eb073570fb8620af3ef5176d718f485fc03bf7f7e44dde90b54e649b0cb8b57992656903c1d4d71a43e062532186fc34ad9c45926750d87545b9b71bf28d639a4c53dd4f68f801dd7d4cf1d026b40dd8301992d0253380987e996e5469701b2191cbdceb382edd2fe242caca1b32cc7dcf4aac85e121ac26ed086446be98fdd5a60cc4b58461ba067c6b8683307f8d0e18809df16d10abf26fe2cc8b06a0189f665ff0454bd967dfee1877fee3270dc71226530e989a53a7a92d19c5bb71c474f2cd9b90b74ecd447b2ebaaac507cdb",
        },
        {
            ssh: "000000077373682d727361000000030100010000010100cbd84e212eae7d428e10105a453226671179219343946025f106ff48c161dc5882cfb0c47fc0ae44cef4ddb0cc672a2c3eadff9c3d1e4d24221c549dc2e20c89fab04c6a642ada8c6076e37c25dbda4eee07e3eb6e170b5841095f11eb56f1223d52b06a4560df11b065b8e02c7c031a102d65410c688e3de385b04e4aa50e9adbb23a4aca3a519c349bfea799a311305f09191f984f3c0a3cc3fd3c5e7b0b3eb81d2ec4f0fc5297b2b90aec85c8a32fbb9784b6e60f1f1a1d1907be5f99bec8879ac1824b5322f975af2aec8c02a8428f2f1ebb43239053619683dde34264844e03839e59a52e58966c4d5505c28a44f46b926ddcb77c95968faa93173d9d9b",
            hex: "0000000000010001cbd84e212eae7d428e10105a453226671179219343946025f106ff48c161dc5882cfb0c47fc0ae44cef4ddb0cc672a2c3eadff9c3d1e4d24221c549dc2e20c89fab04c6a642ada8c6076e37c25dbda4eee07e3eb6e170b5841095f11eb56f1223d52b06a4560df11b065b8e02c7c031a102d65410c688e3de385b04e4aa50e9adbb23a4aca3a519c349bfea799a311305f09191f984f3c0a3cc3fd3c5e7b0b3eb81d2ec4f0fc5297b2b90aec85c8a32fbb9784b6e60f1f1a1d1907be5f99bec8879ac1824b5322f975af2aec8c02a8428f2f1ebb43239053619683dde34264844e03839e59a52e58966c4d5505c28a44f46b926ddcb77c95968faa93173d9d9b",
        },
    ];

    for (const sameKey of sameKeys) {
        it("can decode two key formats", async () => {

            const key1 = renexNode.hexToRSAKey(sameKey.ssh);
            const key2 = renexNode.hexToRSAKey(sameKey.hex);

            // tslint:disable: no-any
            console.assert(JSON.stringify((key1 as any).keyPair.n) === JSON.stringify((key2 as any).keyPair.n));
            console.assert((key1 as any).keyPair.e === (key2 as any).keyPair.e);
            // tslint:enable: no-any

            const shamirN = 24;
            const k = Math.floor((2 * (shamirN + 1)) / 3);
            const tokenShares = shamir.split(shamirN, k, new BN(0x1234));

            await renexNode.encryptForDarknode([tokenShares.get(0), (async () => key1)()]);
            await renexNode.encryptForDarknode([tokenShares.get(0), (async () => key2)()]);
        });
    }
});

describe("get all pods", () => {
    it("can retrieve pods", async () => {
        const web3 = new Web3(`https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`);
        const darknodeRegistryContract = new web3.eth.Contract(DarknodeRegistryABI, networks.mainnet.contracts[0].darknodeRegistry);
        const pods = await renexNode.getAllPods(web3, darknodeRegistryContract, console);
        // console.log(pods);
    });
});
