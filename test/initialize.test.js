const assert = require('assert');
const Compound = require('../src/index.ts');

// Mocked browser `window.ethereum` as unlocked account '0xa0df35...'
const window = { ethereum: require('./window.ethereum.json') };

const providerUrl = 'http://localhost:8545';
const unlockedPrivateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const unlockedMnemonic = 'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

module.exports = function suite() {

  it('initializes compound with ethers default provider', async function () {
    const compound = new Compound();

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes compound with JSON RPC URL', async function () {
    const compound = new Compound(providerUrl);

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes compound with mnemonic', async function () {
    const compound = new Compound(providerUrl, {
      mnemonic: unlockedMnemonic
    });

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes compound with private key', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: unlockedPrivateKey
    });

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes compound as web3', async function () {
    window.ethereum.send = function (request, callback) {}
    const compound = new Compound(window.ethereum);

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

}