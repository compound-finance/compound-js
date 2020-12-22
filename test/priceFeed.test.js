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

  it('runs priceFeed.getPrice underlying asset to USD', async function () {
    const price = await compound.getPrice(Compound.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });

  it('runs priceFeed.getPrice underlying asset to underlying asset', async function () {
    const price = await compound.getPrice(Compound.UNI, Compound.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);

  });

  it('runs priceFeed.getPrice cToken to underlying asset', async function () {
    const price = await compound.getPrice(Compound.cDAI, Compound.WBTC);

    const isPositiveNumber = price > 0;
    const isLessThanOne = price < 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isLessThanOne, true);
  });

  it('runs priceFeed.getPrice underlying asset to cToken', async function () {
    const price = await compound.getPrice(Compound.UNI, Compound.cDAI);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });

  it('runs priceFeed.getPrice cToken to cToken', async function () {
    const price = await compound.getPrice(Compound.cDAI, Compound.cDAI);

    const isPositiveNumber = price > 0;
    const isOne = price === 1;

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
