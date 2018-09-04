# RenEx TypeScript / JavaScript SDK

## Docs

See the [RenEx SDK Docs](https://republicprotocol.github.io/renex-sdk-docs).

## Developer Notes

To build:

```bash
npm run watch
# or
npm run build:dev
```

To update the typescript bindings in `src/contracts/bindings`, you need to clone `renex-sol` and run:

```bash
cd renex-sol
npm run bindings
cd ../
cp renex-sol/test-ts/bindings/*.ts src/contracts/bindings
```
