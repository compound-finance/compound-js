// Compound.js Tests

// To run all tests: `npm test`
// To run a single file's tests: `npm test -- -g './src/eth.ts'`
// To run a single test: `npm test -- -g 'eth.getBalance'`

// Source Files
const api = require('./api.test.js');
const comp = require('./comp.test.js');
const comptroller = require('./comptroller.test.js');
const cToken = require('./cToken.test.js');
// const EIP712 = require('./EIP712.test.js');
const eth = require('./eth.test.js');
// const gov = require('./gov.test.js');
// const helpers = require('./helpers.test.js');
// const construct = require('./constructor.test.js');
// const priceFeed = require('./priceFeed.test.js');
// const util = require('./util.test.js');
// const initialize = require('./initialize.test.js');

// Run a Ganache Core to test against a mainnet fork
const ganache = require('ganache-core');

const server = ganache.server({
  fork: process.env.MAINNET_PROVIDER_URL,
  network_id: 1,
  default_balance_ether: 10000,
});

server.listen(8545, (err, blockchain) => console.error);

const unlockedAccounts = server.provider.manager.state.unlocked_accounts;
const publicKeys = Object.keys(unlockedAccounts);
const privateKeys = publicKeys.map((k) => {
  return '0x' + unlockedAccounts[k].secretKey.toString('hex');
});
const accountsWithTestEth = [ publicKeys, privateKeys ];

// Main test suite
describe('Compound.js', function () {
  describe('./src/api.ts', api.bind(this, accountsWithTestEth));
  describe('./src/comp.ts', comp.bind(this, accountsWithTestEth));
  describe('./src/comptroller.ts', comptroller.bind(this, accountsWithTestEth));
  describe('./src/cToken.ts', cToken.bind(this, accountsWithTestEth));
  describe('./src/eth.ts', eth.bind(this, accountsWithTestEth));
});

after(function () {
  server.close();
});
