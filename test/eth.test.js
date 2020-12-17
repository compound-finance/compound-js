const assert = require('assert');
const ethers = require('ethers');
const eth = require('../src/eth.ts');
const providerUrl = 'http://localhost:8545';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  it('runs eth.getBalance', async function () {
    const ethBalance = await eth.getBalance(acc1.address, providerUrl);

    const ethersProvider = new ethers.providers.JsonRpcProvider(providerUrl);
    const controlBalance = +(await ethersProvider.getBalance(acc1.address)).toString();

    const expected = controlBalance;
    assert.equal(ethBalance, expected);
  });

  it('runs eth.read', async function () {
    const cUsdcMainnetAddress = '0x39aa39c021dfbae8fac545936693ac917d5e7563';
    const result = await eth.read(
      cUsdcMainnetAddress,
      'function decimals() returns (uint8)',
      [],
      { provider: providerUrl }
    );

    const expected = 8;
    assert.equal(result, expected);

  });

  it('runs eth.trx', async function () {
    // Mint some cETH by supplying ETH to the Compound Protocol
    const cEthMainnetAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
    const trx = await eth.trx(
      cEthMainnetAddress,
      'function mint() payable',
      [],
      {
        gasLimit: 150000,
        gasPrice: ethers.utils.parseUnits('20.0', 'gwei'),
        value: ethers.utils.parseEther('1.0'),
        provider: providerUrl,
        privateKey: acc1.privateKey
      }
    );

    const trxReceipt = await trx.wait(1);

    const expected = 4;
    assert.equal(trxReceipt.events.length, expected);

  });

  it('runs eth._createProvider', async function () {
    const provider = await eth._createProvider({ provider: providerUrl });

    const expected = 'JsonRpcProvider';
    assert.equal(provider.constructor.name, expected);
  });

  it('runs eth.getProviderNetwork', async function () {
    const provider = await eth._createProvider({ provider: providerUrl });
    const network = await eth.getProviderNetwork(provider);

    const expected = { id: 1, name: 'mainnet' };
    assert.equal(network.id, expected.id);
    assert.equal(network.name, expected.name);
  });

}
