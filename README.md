# RenEx TypeScript / JavaScript SDK

## Usage

Importing:

```js
import SDK from "./renex-sdk.js";
```

The library exposes the following interface:

```ts
interface RenExSDK {
    address(): string;
    transfer(address: string, token: number, value: BN): Promise<void>;
    balance(token: number): Promise<BN>;
    usableBalance(token: number): Promise<BN>;
    deposit(token: number, value: BN): Promise<void>;
    withdraw(token: number, value: BN, forced: boolean, key: IdempotentKey): Promise<IdempotentKey>;
    status(orderID: OrderID): Promise<OrderStatus>;
    settled(orderID: OrderID): Promise<boolean>;
    openOrder(order: Order): Promise<void>;
    cancelOrder(orderID: OrderID): Promise<void>;
    listOrdersByTrader(address: string): Promise<OrderID[]>;
    listOrdersByStatus(status: OrderStatus): Promise<OrderID[]>;
}
```

## Developer Notes

To update the typescript bindings in `src/contracts/bindings`, you need to clone `renex-sol` and run:

```bash
cd renex-sol
npm run bindings
cd ../
cp renex-sol/test-ts/bindings/*.ts src/contracts/bindings
```
