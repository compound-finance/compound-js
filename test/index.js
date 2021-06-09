// Compound.js Tests

// To run all tests: `npm test`
// To run a single file's tests: `npm test -- -g './src/eth.ts'`
// To run a single test: `npm test -- -g 'eth.getBalance'`

// Set up hardhat
const hre = require('hardhat');
const ethers = require('ethers');
// const ethers = hre.ethers;

// Source Files
const api = require('./api.test.js');
const comp = require('./comp.test.js');
const comptroller = require('./comptroller.test.js');
const cToken = require('./cToken.test.js');
const EIP712 = require('./EIP712.test.js');
const eth = require('./eth.test.js');
const gov = require('./gov.test.js');
const priceFeed = require('./priceFeed.test.js');
const util = require('./util.test.js');
const initialize = require('./initialize.test.js');

const mnemonic = hre.network.config.accounts.mnemonic;
const addresses = [];
const privateKeys = [];
for (let i = 0; i < 20; i++) {
  const wallet = new ethers.Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`);
  addresses.push(wallet.address);
  privateKeys.push(wallet._signingKey().privateKey);
}

let acc = [ addresses, privateKeys ]; // Unlocked accounts with test ETH

// Main test suite
describe('Compound.js', function () {
  before(async () => {
    console.log('Running a hardhat local fork of mainnet...');
    // hre.run('node', { chainId: 1, loggingEnabled: false });
    hre.run('node');
    // await hre.network.provider.send('hardhat_setLoggingEnabled', [ false ]);
    await new Promise(resolve => setTimeout(resolve, 5000));
  });
  describe('./src/api.ts', api.bind(this, acc));
  describe('./src/comp.ts', comp.bind(this, acc));
  describe('./src/comptroller.ts', comptroller.bind(this, acc));
  describe('./src/cToken.ts', cToken.bind(this, acc));
  describe('./src/EIP712.ts', EIP712.bind(this, acc));
  describe('./src/eth.ts', eth.bind(this, acc));
  describe('./src/gov.ts', gov.bind(this, acc));
  describe('./src/priceFeed.ts', priceFeed.bind(this, acc));
  describe('./src/util.ts', util.bind(this, acc));
  describe('initialize', initialize.bind(this, acc));
});
