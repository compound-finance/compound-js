# Compound-JS

A JavaScript SDK for Ethereum and the Compound Protocol.

```js
const cUsdtAddress = '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9';

(async function() {

let supplyRatePerBlock = await Compound.eth.read(
  cUsdtAddress,
  'function supplyRatePerBlock() returns (uint)',
  // [], // [optional] parameters
  // {}  // [optional] call options, provider, network, plus ethers "overrides"
);

console.log('USDT supplyRatePerBlock:', supplyRatePerBlock.toString());

})().catch((err) => {
  console.error(err);
});
```

## Build for Node.js & Browser

```
npm run build
```
