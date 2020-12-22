const assert = require('assert');
const ethers = require('ethers');
const comptroller = require('../src/comptroller.ts');
const Compound = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  const compound = new Compound(providerUrl, {
    privateKey: acc1.privateKey
  });

  it('runs comptroller.enterMarkets single asset', async function () {
    const trx = await compound.enterMarkets(Compound.ETH);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 1;
    const eventExpected = 'MarketEntered';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('runs comptroller.enterMarkets multiple assets', async function () {
    const trx = await compound.enterMarkets(
      [ Compound.DAI, Compound.USDC, Compound.UNI ]
    );
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 3;
    const eventExpected = 'MarketEntered';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('fails comptroller.enterMarkets cToken string', async function () {
    const errorMessage = 'Compound [enterMarkets] | Argument `markets` must be an array or string.';
    try {
      const trx = await compound.enterMarkets(null);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails comptroller.enterMarkets invalid cToken', async function () {
    const errorMessage = 'Compound [enterMarkets] | Provided market `cbadctokenname` is not a recognized cToken.';
    try {
      const trx = await compound.enterMarkets(['USDC', 'badctokenname']);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs comptroller.exitMarket', async function () {
    const enterMarketsTrx = await compound.enterMarkets(Compound.ETH);
    await enterMarketsTrx.wait(1);

    const trx = await compound.exitMarket(Compound.ETH);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const event = receipt.events[0].event;

    const numEventsExpected = 1;
    const eventExpected = 'MarketExited';

    assert.equal(numEvents, numEventsExpected);
    assert.equal(event, eventExpected);
  });

  it('fails comptroller.exitMarket cToken string', async function () {
    const errorMessage = 'Compound [exitMarket] | Argument `market` must be a string of a cToken market name.';
    try {
      const trx = await compound.exitMarket(null);
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails comptroller.exitMarket invalid cToken', async function () {
    const errorMessage = 'Compound [exitMarket] | Provided market `cbadctokenname` is not a recognized cToken.';
    try {
      const trx = await compound.exitMarket('badctokenname');
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}
