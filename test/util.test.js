const assert = require('assert');
const util = require('../src/util.ts');

module.exports = function suite() {

  it('runs util.getAddress', async function () {
    const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';
    const result = util.getAddress('cETH');

    const expectedAddress = cEthAddress.toLowerCase();

    assert.equal(result.toLowerCase(), expectedAddress);
  });

  it('runs util.getAbi', async function () {
    const result = util.getAbi('cEther');

    const isArray = Array.isArray(result);

    assert.equal(isArray, true);
  });

  it('runs util.getNetNameWithChainId', async function () {
    const result = util.getNetNameWithChainId(5);

    const expectedResult = 'goerli';

    assert.equal(result, expectedResult);
  });

  it('runs util.getNetNameWithChainId fails deprecated chain', async function () {
    const errorMessage = 'Util.getNetNameWithChainId invalid chainId.';
    try {
      const result = util.getNetNameWithChainId(3); // ropsten
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}