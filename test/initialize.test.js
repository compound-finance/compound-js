// Run this whole test file using this commend:
// npm test -- -g 'initialize'
const ethers = require('ethers');
const assert = require('assert');
const Compound = require('../src/index.ts');

// Mocked browser `window.ethereum` as unlocked account '0xa0df35...'
const _window = { ethereum: require('./window.ethereum.json') };

const providerUrl = require('./config.js').httpProviderUrl;
const unlockedPrivateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const unlockedMnemonic = 'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

const cometBadProviderError = 'Compound.js Comet constructor was passed a provider that is not compatible with the selected Comet instance.';
const cometBatNetworkError = 'Compound.js Comet constructor was passed a provider with an invalid network.';

module.exports = function suite() {

  it('initializes Compound with ethers default provider', async function () {
    const compound = new Compound();

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes Compound with JSON RPC URL', async function () {
    const compound = new Compound(providerUrl);

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes Compound with mnemonic', async function () {
    const compound = new Compound(providerUrl, {
      mnemonic: unlockedMnemonic
    });

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes Compound with private key', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: unlockedPrivateKey
    });

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes Compound as web3', async function () {
    // make a fresh copy, so our newly defined functions don't break other tests
    const window = JSON.parse(JSON.stringify(_window));

    window.ethereum.send = function (request, callback) {}
    const compound = new Compound(window.ethereum);

    const expectedType = 'object';

    assert.equal(typeof compound, expectedType);
  });

  it('initializes Comet cUSDCv3 Mainnet Ethereum using fallback', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, false);
    assert.equal(cometDeploymentName, 'mainnet_usdc');
  });

  it('Fails init of Comet cUSDCv3 Polygon using fallback', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.POLYGON_USDC();

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, cometBadProviderError);
    assert.equal(cometDeploymentName, 'polygon_usdc');
  });

  it('Fails init of Comet cUSDCv3 Mainnet using Goerli fallback', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC('goerli');

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, cometBadProviderError);
    assert.equal(cometDeploymentName, 'mainnet_usdc');
  });

  it('Fails init of Comet cUSDCv3 Polygon using passed JSON RPC provider URL', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.POLYGON_USDC(providerUrl);

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, cometBadProviderError);
    assert.equal(cometDeploymentName, 'polygon_usdc');
  });

  it('initializes Comet cUSDCv3 Mainnet Ethereum using passed JSON RPC provider URL', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC(providerUrl);

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, false);
    assert.equal(cometDeploymentName, 'mainnet_usdc');
  });

  it('initializes Comet cUSDCv3 Mainnet Ethereum using passed ethers JSON RPC provider', async function () {
    const compound = new Compound(providerUrl);

    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    const comet = compound.comet.MAINNET_USDC(provider);

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, false);
    assert.equal(cometDeploymentName, 'mainnet_usdc');
  });

  it('initializes Comet cUSDCv3 Mainnet Ethereum using passed ethers JSON RPC provider wallet', async function () {
    const compound = new Compound(providerUrl);

    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(unlockedPrivateKey, provider);

    const comet = compound.comet.MAINNET_USDC(wallet);

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, false);
    assert.equal(cometDeploymentName, 'mainnet_usdc');
  });

  it('initializes Comet as web3', async function () {
    // make a fresh copy, so our newly defined functions don't break other tests
    const window = JSON.parse(JSON.stringify(_window));

    let callFlag = false;
    window.ethereum.send = async function (request, callback) {
      if (request.method === 'eth_call') { // getUtilization later
        callFlag = true;
        callback(false, { result: '0x7b' });
      } else { // eth_chainId or net_version
        callback(false, { result: 1 }); // tells Compound.js the provider is for mainnet
      }
    }
    const compound = new Compound(window.ethereum);

    const comet = compound.comet.MAINNET_USDC(window.ethereum);

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, false);
    assert.equal(cometDeploymentName, 'mainnet_usdc');

    try {
      const utilization = +(await comet.getUtilization());
      assert.equal(typeof utilization, 'number', 'proper init confirmation failed');
    } catch(e) {
      // wasn't able to mock out the send method properly
      // we're swinging for the comet provider blocker error, if the flag is set then we're good
      assert.equal(callFlag, true);
    }
  });

  it('fails initialize Comet as web3 provider mismatch', async function () {
    // make a fresh copy, so our newly defined functions don't break other tests
    const window = JSON.parse(JSON.stringify(_window));

    window.ethereum.send = async function (request, callback) {
      callback(false, { result: 5 }); // tells Compound.js the provider is for goerli not mainnet
    }
    const compound = new Compound(window.ethereum);

    const comet = compound.comet.MAINNET_USDC(window.ethereum);

    await comet._networkPromise;

    const invalidProvider = comet._invalidProvider;
    const cometDeploymentName = comet._cometDeploymentName;

    assert.equal(invalidProvider, cometBadProviderError);
    assert.equal(cometDeploymentName, 'mainnet_usdc');

    try {
      const utilization = +(await comet.getUtilization());
    } catch(e) {
      assert.equal(e.toString().includes(cometBadProviderError), true, 'provider blocker error not thrown');
    }
  });

}