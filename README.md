# Compound-JS

A JavaScript SDK for Ethereum and the Compound Protocol.

JSON RPC based **read** and **write**.

```js
const Compound = require('compound-js');
const cUsdtAddress = '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9';

(async function() {

  let supplyRatePerBlock = await Compound.eth.read(
    cUsdtAddress,
    'function supplyRatePerBlock() returns (uint)',
    [], // [optional] parameters
    {}  // [optional] call options, provider, network, ethers.js "overrides"
  );

  console.log('USDT supplyRatePerBlock:', supplyRatePerBlock.toString());

})().catch((err) => {
  console.error(err);
});
```

Simple methods for using the Compound protocol.

```js
const Compound = require('compound-js');
const compound = new Compound('mainnet', { privateKey: process.env.pk });

(async function() {

  const trx = await compound.supply(Compound.ETH, 10);

  console.log(trx);

})().catch((err) => {
  console.error(err);
});
```

## Build for Node.js & Browser

```
npm run build
```
