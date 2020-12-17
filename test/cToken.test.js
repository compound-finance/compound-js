const assert = require('assert');
const ethers = require('ethers');
const cToken = require('../src/cToken.ts');
const Compound = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

// supply
// redeem
// borrow
// repayBorrow

module.exports = function suite(acc1) {

  const compound = new Compound(providerUrl, {
    privateKey: acc1.privateKey
  });

  it('runs cToken.supply', async function () {
    const trx = await compound.supply(Compound.ETH, 10);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = [];
    receipt.events.forEach(e => events.push(e.event));

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Mint'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('fails cToken.supply asset type', async function () {
    const errorMessage = 'Compound [supply] | Argument `asset` cannot be supplied.';
    try {
      const trx = await compound.supply(null, 10); // bad asset type
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.supply bad amount', async function () {
    const errorMessage = 'Compound [supply] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await compound.supply('ETH', null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}