const assert = require('assert');
const ethers = require('ethers');
const Compound = require('../src/index.ts');
const { request } = require('../src/util.ts');
const providerUrl = require('./config.js').httpProviderUrl;

function wait(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms); });
}

module.exports = function suite([ publicKeys, privateKeys ]) {

  const compound = new Compound(providerUrl);

  it('runs priceFeed.getPrice underlying asset to USD', async function () {
    const compound = new Compound(providerUrl);

    const price = await compound.getPrice(Compound.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });

  it('runs priceFeed.getPrice underlying asset to underlying asset', async function () {
    const compound = new Compound(providerUrl);

    const price = await compound.getPrice(Compound.UNI, Compound.WBTC);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);

  });

  it('runs priceFeed.getPrice cToken to underlying asset', async function () {
    const compound = new Compound(providerUrl);

    const price = await compound.getPrice(Compound.cDAI, Compound.WBTC);

    const isPositiveNumber = price > 0;
    const isLessThanOne = price < 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isLessThanOne, true);
  });

  it('runs priceFeed.getPrice underlying asset to cToken', async function () {
    const compound = new Compound(providerUrl);

    const price = await compound.getPrice(Compound.UNI, Compound.cDAI);

    const isPositiveNumber = price > 0;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
  });

  it('runs priceFeed.getPrice cToken to cToken', async function () {
    const compound = new Compound(providerUrl);

    const price = await compound.getPrice(Compound.cDAI, Compound.cDAI);

    const isPositiveNumber = price > 0;
    const isOne = price === 1;

    assert.equal(typeof price, 'number');
    assert.equal(isPositiveNumber, true);
    assert.equal(isOne, true);
  });

  it('fails priceFeed.getPrice bad asset', async function () {
    const compound = new Compound(providerUrl);

    const errorMessage = 'Compound [getPrice] | Argument `asset` must be a non-empty string.';
    try {
      price = await compound.getPrice('');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails priceFeed.getPrice invalid asset', async function () {
    const compound = new Compound(providerUrl);

    const errorMessage = 'Compound [getPrice] | Argument `asset` is not supported.';
    try {
      price = await compound.getPrice('UUU');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs priceFeed.getPrice for LINK', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.LINK);
      // console.log('LINK', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for BTC', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.BTC);
      // console.log('BTC', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for AAVE', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.AAVE);
      // console.log('AAVE', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for BAT', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.BAT);
      // console.log('BAT', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for COMP', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.COMP);
      // console.log('COMP', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for DAI', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.DAI);
      // console.log('DAI', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for ETH', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.ETH);
      // console.log('ETH', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for FEI', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.FEI);
      // console.log('FEI', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for MKR', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.MKR);
      // console.log('MKR', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for REP', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.REP);
      // console.log('REP', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for SAI', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.SAI);
      // console.log('SAI', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for SUSHI', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.SUSHI);
      // console.log('SUSHI', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for TUSD', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.TUSD);
      // console.log('TUSD', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for UNI', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.UNI);
      // console.log('UNI', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for USDC', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.USDC);
      // console.log('USDC', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for USDP', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.USDP);
      // console.log('USDP', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for USDT', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.USDT);
      // console.log('USDT', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for WBTC', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.WBTC);
      // console.log('WBTC', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for YFI', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.YFI);
      // console.log('YFI', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

  it('runs priceFeed.getPrice for ZRX', async function () {
    const compound = new Compound(providerUrl);

    let price;
    try {
      price = await compound.getPrice(Compound.ZRX);
      // console.log('ZRX', 'price', price);
    } catch (error) {
      console.error(error);
    }

    assert.equal(typeof price, 'number', 'Ensure returned object is a number');
    assert.equal(price > 0, true, 'Ensure the returned price is > 0');

  });

}
