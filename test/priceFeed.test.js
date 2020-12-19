const assert = require('assert');
const ethers = require('ethers');
const Compound = require('../src/index.ts');
const { request } = require('../src/util.ts');
const providerUrl = 'http://localhost:8545';

function wait(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

module.exports = function suite([ publicKeys, privateKeys ]) {

  const compound = new Compound(providerUrl);

  it('runs priceFeed.getPrice', async function () {
    let price, isPositiveNumber;

    price = await compound.getPrice(Compound.WBTC);

    isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);

    price = await compound.getPrice(Compound.UNI, Compound.WBTC);

    isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);

    price = await compound.getPrice(Compound.cDAI, Compound.WBTC);

    isPositiveNumber = price > 0;
    isLessThanOne = price < 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isLessThanOne, true);

    price = await compound.getPrice(Compound.UNI, Compound.cDAI);

    isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);

    price = await compound.getPrice(Compound.cDAI, Compound.cDAI);

    isPositiveNumber = price > 0;
    isOne = price === 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isOne, true);
  });

  it('fails priceFeed.getPrice bad asset', async function () {
    const errorMessage = 'Compound [getPrice] | Argument `asset` must be a non-empty string.';
    try {
      price = await compound.getPrice('');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails priceFeed.getPrice invalid asset', async function () {
    const errorMessage = 'Compound [getPrice] | Argument `asset` is not supported.';
    try {
      price = await compound.getPrice('UUU');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}
