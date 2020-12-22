const assert = require('assert');
const ethers = require('ethers');
const cToken = require('../src/cToken.ts');
const Compound = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };
  const acc2 = { address: publicKeys[1], privateKey: privateKeys[1] };

  const compound = new Compound(providerUrl, {
    privateKey: acc1.privateKey
  });

  const compound2 = new Compound(providerUrl, {
    privateKey: acc2.privateKey
  });

  it('runs cToken.supply ETH', async function () {
    const trx = await compound.supply(Compound.ETH, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Mint'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs cToken.supply USDC', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await compound.supply(Compound.USDC, 2);
    const receipt = await supplyUsdcTrx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Mint'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs cToken.supply USDC no approve', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await compound.supply(Compound.USDC, 2, true);
    const receipt = await supplyUsdcTrx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Failure'), true);
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

  it('runs cToken.redeem ETH', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 1);
    await supplyEthTrx.wait(1);

    const trx = await compound.redeem(Compound.ETH, 1);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs cToken.redeem USDC', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await compound.supply(Compound.USDC, 2);
    await supplyUsdcTrx.wait(1);

    const trx = await compound.redeem(Compound.USDC, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs cToken.redeem cUSDC', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const supplyUsdcTrx = await compound.supply(Compound.USDC, 2);
    await supplyUsdcTrx.wait(1);

    const trx = await compound.redeem(Compound.cUSDC, 2);
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    let numbTransfers = 0;
    events.forEach(e => { if (e === 'Transfer') numbTransfers++ });

    const numEventsExpected = 5;
    const numbTransfersExpected = 2;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(numbTransfers, numbTransfersExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Redeem'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('fails cToken.redeem bad asset', async function () {
    const errorMessage = 'Compound [redeem] | Argument `asset` must be a non-empty string.';
    try {
      const trx = await compound.redeem(null, 2); // bad asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.redeem invalid asset', async function () {
    const errorMessage = 'Compound [redeem] | Argument `asset` is not supported.';
    try {
      const trx = await compound.redeem('UUUU', 2); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.redeem invalid cToken', async function () {
    const errorMessage = 'Compound [redeem] | Argument `asset` is not supported.';
    try {
      const trx = await compound.redeem('cUUUU', 2); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.redeem bad amount', async function () {
    const errorMessage = 'Compound [redeem] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await compound.redeem(Compound.cUSDC, null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs cToken.borrow USDC', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const trx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Borrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs cToken.borrow ETH', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const trx = await compound.borrow(Compound.ETH, 1, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const events = receipt.events.map(e => e.event);

    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('Borrow'), true);
  });

  it('fails cToken.borrow invalid asset', async function () {
    const errorMessage = 'Compound [borrow] | Argument `asset` cannot be borrowed.';
    try {
      const trx = await compound.borrow('UUUU', 5); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.borrow bad amount', async function () {
    const errorMessage = 'Compound [borrow] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await compound.borrow(Compound.USDC, null); // bad amount
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs cToken.repayBorrow USDC', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await compound.repayBorrow(Compound.USDC, 5, null, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 4;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs cToken.repayBorrow ETH', async function () {
    const supplyEthTrx = await compound.supply(Compound.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await compound.borrow(Compound.ETH, 1, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await compound.repayBorrow(Compound.ETH, 1, null, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
  });

  it('runs cToken.repayBorrow behalf USDC', async function () {
    const supplyEthTrx2 = await compound2.supply(Compound.ETH, 2);
    await supplyEthTrx2.wait(1);

    const enterEthMarket2 = await compound2.enterMarkets(Compound.ETH);
    await enterEthMarket2.wait(1);

    const borrowTrx2 = await compound2.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowTrx2.wait(1);

    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    // acc1 repays USDCborrow on behalf of acc2
    const trx = await compound.repayBorrow(Compound.USDC, 5, acc2.address, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);
    const repayBorrowEvent = receipt.events.find(e => e.event === 'RepayBorrow');
    const payer = repayBorrowEvent.args[0].toLowerCase();
    const borrower = repayBorrowEvent.args[1].toLowerCase();

    const payerExpected = acc1.address.toLowerCase();
    const borrowerExpected = acc2.address.toLowerCase();
    const numEventsExpected = 4;

    assert.equal(payer, payerExpected);
    assert.equal(borrower, borrowerExpected);
    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
    assert.equal(events.includes('Transfer'), true);
  });

  it('runs cToken.repayBorrow behalf ETH', async function () {
    const supplyEthTrx = await compound2.supply(Compound.ETH, 10);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound2.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowTrx = await compound2.borrow(Compound.ETH, 1, { gasLimit: 600000 });
    await borrowTrx.wait(1);

    const trx = await compound.repayBorrow(Compound.ETH, 1, acc2.address, false, { gasLimit: 600000 });
    const receipt = await trx.wait(1);

    const numEvents = receipt.events.length;
    const events = receipt.events.map(e => e.event);
    const repayBorrowEvent = receipt.events.find(e => e.event === 'RepayBorrow');
    const payer = repayBorrowEvent.args[0].toLowerCase();
    const borrower = repayBorrowEvent.args[1].toLowerCase();

    const payerExpected = acc1.address.toLowerCase();
    const borrowerExpected = acc2.address.toLowerCase();

    const numEventsExpected = 3;

    assert.equal(numEvents, numEventsExpected);
    assert.equal(events.includes('AccrueInterest'), true);
    assert.equal(events.includes('RepayBorrow'), true);
  });

  it('fails cToken.repayBorrow bad asset', async function () {
    const errorMessage = 'Compound [repayBorrow] | Argument `asset` is not supported.';
    try {
      const trx = await compound.repayBorrow(null, 1, acc2.address, false); // bad asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.repayBorrow invalid asset', async function () {
    const errorMessage = 'Compound [repayBorrow] | Argument `asset` is not supported.';
    try {
      const trx = await compound.repayBorrow('xxxx', 1, acc2.address, false); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.repayBorrow bad amount', async function () {
    const errorMessage = 'Compound [repayBorrow] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await compound.repayBorrow('USDC', null, acc2.address, false); // invalid asset
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails cToken.repayBorrow behalf address', async function () {
    const errorMessage = 'Compound [repayBorrow] | Invalid `borrower` address.';
    try {
      const trx = await compound.repayBorrow('USDC', 1, '0xbadaddress', false); // bad address
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

}