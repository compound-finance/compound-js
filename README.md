# Compound.js [Alpha]

A JavaScript SDK for Ethereum and the Compound Protocol. A wrapper around [Ethers.js](https://github.com/ethers-io/ethers.js/). Works in the web browser and Node.js.

**This SDK is in Alpha, and is constantly under development. Use at your own risk.**

## Ethereum Read & Write

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

## Compound Protocol

Simple methods for using the Compound protocol.

```js
const compound = new Compound(window.ethereum);

// Ethers.js overrides are an optional 3rd parameter for `supply`
// const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  console.log('Supplying ETH to the Compound protocol...');
  const trx = await compound.supply(Compound.ETH, 1);
  console.log('Ethers.js transaction object', trx);

})().catch(console.error);
```

## More Code Examples

- [Node.js](https://github.com/compound-developers/compound-js/tree/master/examples/nodejs)
- [Web Browser](https://compound-developers.github.io/compound-js/examples/web/)

## Mantissas

Parameters of number values can be plain numbers or their scaled up mantissa values. There is a transaction option boolean to tell the SDK what the developer is passing.

```js
// 1 Dai
await compound.borrow(Compound.DAI, '1000000000000000000', { mantissa: true });

// `mantissa` defaults to false if it is not specified or if an options object is not passed
await compound.borrow(Compound.DAI, 1, { mantissa: false });
```

## Transaction Options

Each method that interacts with the blockchain accepts a final optional parameter for overrides, much like Ethers.js.
```js
// The options object itself and all options are optional
const trxOptions = {
  mantissa,          // Boolean, parameters array arg of 1 ETH would be '1000000000000000000' (true) vs 1 (false)
  _compoundProvider, // Ethereum provider from a Compound.js instance
  abi,               // Definition string or an ABI array from a solc build
  provider,          // JSON RPC string, Web3 object, or Ethers.js fallback network (string)
  network,           // Ethers.js fallback network provider, "provider" has precedence over "network"
  from,              // Address that the Ethereum transaction is send from
  gasPrice,          // Ethers.js override `Compound_ethers.utils.parseUnits('10.0', 'gwei')`
  gasLimit,          // Ethers.js override - see https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
  value,             // Number or string
  data,              // Number or string
  chainId,           // Number
  nonce,             // Number
  privateKey,        // String, meant to be used with `Compound.eth.trx` (server side)
  mnemonic,          // String, meant to be used with `Compound.eth.trx` (server side)
};
```

## Build for Node.js & Browser

```
npm run build
```
