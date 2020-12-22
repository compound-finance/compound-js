# Compound.js

[![Build Status](https://github.com/compound-finance/compound-js/workflows/Build/badge.svg)](https://github.com/compound-finance/compound-js/actions)
[![codecov](https://codecov.io/gh/compound-finance/compound-js/branch/master/graph/badge.svg?token=85IDEVM3U0)](https://codecov.io/gh/compound-finance/compound-js)

A JavaScript SDK for Ethereum and the Compound Protocol. Wraps around [Ethers.js](https://github.com/ethers-io/ethers.js/). Works in the **web browser** and **Node.js**.

[Compound.js Documentation](https://compound.finance/docs/compound-js)

This SDK is in **open beta**, and is constantly under development. **USE AT YOUR OWN RISK**.

## Ethereum Read & Write

JSON RPC based Ethereum **read** and **write**.

### Read

```js
const Compound = require('@compound-finance/compound-js'); // in Node.js
const cUsdtAddress = Compound.util.getAddress(Compound.cUSDT);

(async function() {

  let supplyRatePerBlock = await Compound.eth.read(
    cUsdtAddress,
    'function supplyRatePerBlock() returns (uint)',
    [], // [optional] parameters
    {}  // [optional] call options, provider, network, ethers.js "overrides"
  );

  console.log('USDT supplyRatePerBlock:', supplyRatePerBlock.toString());

})().catch(console.error);
```

### Write

```js
const toAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';

(async function() {

  const trx = await Compound.eth.trx(
    toAddress,
    'function send() external payable',
    [],
    {
      value: Compound._ethers.utils.parseEther('1.0'), // 1 ETH
      provider: window.ethereum, // in a web browser
    }
  );

  const toAddressEthBalance = await Compound.eth.getBalance(toAddress);

})().catch(console.error);
```

## Compound Protocol

Simple methods for using the Compound protocol.

```js
const compound = new Compound(window.ethereum); // in a web browser

// Ethers.js overrides are an optional 3rd parameter for `supply`
// const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  console.log('Supplying ETH to the Compound protocol...');
  const trx = await compound.supply(Compound.ETH, 1);
  console.log('Ethers.js transaction object', trx);

})().catch(console.error);
```

## Install / Import

Web Browser

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@compound-finance/compound-js@latest/dist/browser/compound.min.js"></script>

<script type="text/javascript">
  window.Compound; // or `Compound`
</script>
```

Node.js

```
npm install @compound-finance/compound-js
```

```js
const Compound = require('@compound-finance/compound-js');

// or, when using ES6

import Compound from '@compound-finance/compound-js';
```

## More Code Examples

- [Node.js](https://github.com/compound-finance/compound-js/tree/master/examples)
- [Web Browser](https://compound-finance.github.io/compound-js/examples/web/)

[To run, boot Ganache fork of mainnet locally](https://github.com/compound-finance/compound-js/tree/master/examples)

## Instance Creation

The following are valid Ethereum providers for initialization of the SDK.

```js
var compound = new Compound(window.ethereum); // web browser

var compound = new Compound('http://127.0.0.1:8545'); // HTTP provider

var compound = new Compound(); // Uses Ethers.js fallback mainnet (for testing only)

var compound = new Compound('ropsten'); // Uses Ethers.js fallback (for testing only)

// Init with private key (server side)
var compound = new Compound('https://mainnet.infura.io/v3/_your_project_id_', {
  privateKey: '0x_your_private_key_', // preferably with environment variable
});

// Init with HD mnemonic (server side)
var compound = new Compound('mainnet' {
  mnemonic: 'clutch captain shoe...', // preferably with environment variable
});
```

## Constants and Contract Addresses

Names of contracts, their addresses, ABIs, token decimals, and more can be found in `/src/constants.ts`. Addresses, for all networks, can be easily fetched using the `getAddress` function, combined with contract name constants.

```js
console.log(Compound.DAI, Compound.ETH, Compound.cETH);
// DAI, ETH, cETH

const cUsdtAddress = Compound.util.getAddress(Compound.cUSDT);
// Mainnet cUSDT address. Second parameter can be a network like 'ropsten'.
```

## Mantissas

Parameters of number values can be plain numbers or their scaled up mantissa values. There is a transaction option boolean to tell the SDK what the developer is passing.

```js
// 1 Dai
await compound.borrow(Compound.DAI, '1000000000000000000', { mantissa: true });

// `mantissa` defaults to false if it is not specified or if an options object is not passed
await compound.borrow(Compound.DAI, 1, { mantissa: false });
```

## Transaction Options

Each method that interacts with the blockchain accepts a final optional parameter for overrides, much like [Ethers.js overrides](https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides).
```js
// The options object itself and all options are optional
const trxOptions = {
  mantissa,   // Boolean, parameters array arg of 1 ETH would be '1000000000000000000' (true) vs 1 (false)
  abi,        // Definition string or an ABI array from a solc build
  provider,   // JSON RPC string, Web3 object, or Ethers.js fallback network (string)
  network,    // Ethers.js fallback network provider, "provider" has precedence over "network"
  from,       // Address that the Ethereum transaction is send from
  gasPrice,   // Ethers.js override `Compound._ethers.utils.parseUnits('10.0', 'gwei')`
  gasLimit,   // Ethers.js override - see https://docs.ethers.io/ethers.js/v5-beta/api-contract.html#overrides
  value,      // Number or string
  data,       // Number or string
  chainId,    // Number
  nonce,      // Number
  privateKey, // String, meant to be used with `Compound.eth.trx` (server side)
  mnemonic,   // String, meant to be used with `Compound.eth.trx` (server side)
};
```

## API

The [Compound API](https://compound.finance/docs/api) is accessible from Compound.js. The corresponding services are defined in the `api` namespace on the class.

- `Compound.api.account`
- `Compound.api.cToken`
- `Compound.api.marketHistory`
- `Compound.api.governance`

The governance method requires a second parameter (string) for the corresponding endpoint shown in the [documentation](https://compound.finance/docs/api#GovernanceService).

- `proposals`
- `voteReceipts`
- `accounts`

Here is an example for using the `account` endpoint. The `network` parameter in the request body is optional and defaults to `mainnet`.

```js
const main = async () => {
  const account = await Compound.api.account({
    "addresses": "0xB61C5971d9c0472befceFfbE662555B78284c307",
    "network": "ropsten"
  });

  let daiBorrowBalance = 0;
  if (Object.isExtensible(account) && account.accounts) {
    account.accounts.forEach((acc) => {
      acc.tokens.forEach((tok) => {
        if (tok.symbol === Compound.cDAI) {
          daiBorrowBalance = +tok.borrow_balance_underlying.value;
        }
      });
    });
  }

  console.log('daiBorrowBalance', daiBorrowBalance);
}

main().catch(console.error);
```

## Build for Node.js & Web Browser

```
git clone git@github.com:compound-finance/compound-js.git
cd compound-js/
npm install
npm run build
```

### Web Browser Build
```html
<!-- Local build (do `npm install` first) -->
<script type="text/javascript" src="./dist/browser/compound.min.js"></script>

<!-- Public NPM -> jsdeliver build -->
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@compound-finance/compound-js@latest/dist/browser/compound.min.js"></script>
```

### Node.js Build
```js
// Local build (do `npm install` first)
const Compound = require('./dist/nodejs/index.js');

// Public NPM build
const Compound = require('@compound-finance/compound-js');
```
