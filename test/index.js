// Compound.js Tests

// To run all tests: `npm test`
// To run a single file's tests: `npm test -- -g 'eth.'`
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
});

server.listen(8545, (err, blockchain) => console.error);

const unlockedAccounts = server.provider.manager.state.unlocked_accounts;
const publicKeys = Object.keys(unlockedAccounts);

// Use the first unlocked account from Ganache Core to send test transactions
const acc1 = {
  address: publicKeys[0],
  privateKey: '0x' + unlockedAccounts[publicKeys[0]].secretKey.toString('hex')
};

// Main test suite
describe('Compound.js', function () {
  describe('./src/api.ts', api.bind(this));
  describe('./src/comp.ts', comp.bind(this, acc1));
  describe('./src/comptroller.ts', comptroller.bind(this, acc1));
  describe('./src/cToken.ts', cToken.bind(this, acc1));
  describe('./src/eth.ts', eth.bind(this, acc1));
});

after(function () {
  server.close();
});
