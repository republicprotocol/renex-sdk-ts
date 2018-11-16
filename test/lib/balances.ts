// import BigNumber from "bignumber.js";

// import * as balances from "@Library/balances";

// import { Token } from "@Library/market";

// test("it should convert a balance to a readable amount", () => {
//     const amount = new BigNumber(5);
//     const ethDigits = 18;
//     const dgxDigits = 9;
//     expect(balances.balanceToReadable(amount, Token.ETH)).toEqual(amount.div(10 ** ethDigits));
//     expect(balances.balanceToReadable(amount, Token.DGX)).toEqual(amount.div(10 ** dgxDigits));
// });

// test("it should convert a readable amount to a balance", () => {
//     const amount = "5";
//     const ethDigits = 18;
//     const dgxDigits = 9;
//     expect(balances.readableToBalance(amount, Token.ETH)).toEqual(new BigNumber(amount).times(10 ** ethDigits));
//     expect(balances.readableToBalance(amount, Token.DGX)).toEqual(new BigNumber(amount).times(10 ** dgxDigits));
// });
