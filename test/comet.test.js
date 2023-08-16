/*
 * run using:
 * npm test -- -g './src/comet.ts'
 * or single test:
 * npm test -- -g 'runs comet.supply for the sender'
 */

const assert = require('assert');
const ethers = require('ethers');
// const comet = require('../src/comet.ts');
const Compound = require('../src/index.ts');
const providerUrl = require('./config.js').httpProviderUrl;
const hre = require('hardhat');

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };
  const acc2 = { address: publicKeys[1], privateKey: privateKeys[1] };

  // isValidEthereumAddress
  it('fails comet helper isValidEthereumAddress', async function () {
    const errorMessage = 'Compound Comet [supply] | Argument `from` is not a string or is an invalid address.';
    let resultError1, resultError2, resultError3;

    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    try {
      const trx = await comet.supply(
        123, // bad from address
        compound._provider.address, // to me
        Compound.USDC,
        1
      );
      await trx.wait(1);
    } catch (e) {
      resultError1 = e.message;
    }

    try {
      const trx = await comet.supply(
        '123', // bad from address
        compound._provider.address, // to me
        Compound.USDC,
        1
      );
      await trx.wait(1);
    } catch (e) {
      resultError2 = e.message;
    }

    try {
      const trx = await comet.supply(
        '0x123', // bad from address
        compound._provider.address, // to me
        Compound.USDC,
        1
      );
      await trx.wait(1);
    } catch (e) {
      resultError3 = e.message;
    }

    assert.equal(resultError1, errorMessage);
    assert.equal(resultError2, errorMessage);
    assert.equal(resultError3, errorMessage);
  });

  it('runs comet.supply for the sender', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    // First, seed the account with USDC using Compound v2
    const supplyEthTrx = await compound.supply(Compound.ETH, 2);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.USDC, 5, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    // Supply to Comet
    let receipt;
    try {
      const trx = await comet.supply(
        compound._provider.address, // from me
        compound._provider.address, // to me
        Compound.USDC,
        1,
      );
      receipt = await trx.wait(1);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('fails comet.supply bad input', async function () {
    let errorMessage = 'Compound Comet [supply] | Argument `from` is not a string or is an invalid address.';
    let resultError;

    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    let receipt;
    try {
      const trx = await comet.supply(
        null, // bad from address
        compound._provider.address, // to me
        Compound.USDC,
        1
      );
      receipt = await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);

    errorMessage = 'Compound Comet [supply] | Argument `asset` cannot be supplied.';
    try {
      const trx = await comet.supply(
        compound._provider.address,
        compound._provider.address,
        'fail',
        1
      );
      receipt = await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);
  });

  it('runs comet.allow successfully', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    // Allow a manager within Comet
    let receipt;
    try {
      const trx = await comet.allow(
        '0x1231231231231231231231231231231231231231',
        true
      );
      receipt = await trx.wait(1);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('runs comet.createAllowSignature successfully', async function () {
    const _compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = _compound.comet.MAINNET_USDC();

    const expiry = 10e9;
    const allowSignature = await comet.createAllowSignature(
      '0x1231231231231231231231231231231231231231',
      true,
      expiry
    );

    const expectedSignature = {
      r: '0x4796f9d8438524e510ef493152e808b344487836d2cd5eaf90cfbb940bb219a8',
      s: '0x3f24523f2a4c27fae33c6126b2a832ca60037791d266f3346b484db674fecae3',
      v: '0x1c'
    }

    assert.equal(allowSignature.r, expectedSignature.r);
    assert.equal(allowSignature.s, expectedSignature.s);
    assert.equal(allowSignature.v, expectedSignature.v);
  });

  it('runs comet.allowBySig successfully', async function () {
    const _compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = _compound.comet.MAINNET_USDC();

    const manager = '0x1231231231231231231231231231231231231231';
    const expiry = 10e9;
    const allowSignature = await comet.createAllowSignature(
      manager,
      true,
      expiry
    );

    const expectedOwner = _compound._provider.address;
    const expectedSpender = manager;
    const uIntMaxAsString = '115792089237316195423570985008687907853269984665640564039457584007913129639935';

    // Allow a manager within Comet
    let resultOwner, resultSpender, resultAmount;
    try {
      const trx = await comet.allowBySig(
        _compound._provider.address,
        manager,
        true,
        0,
        expiry,
        allowSignature
      );
      const receipt = await trx.wait(1);

      resultOwner = receipt.events[0].args.owner.toString();
      resultSpender = receipt.events[0].args.spender.toString();
      resultAmount = receipt.events[0].args.amount.toString();
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(resultOwner, expectedOwner);
    assert.equal(resultSpender, expectedSpender);
    assert.equal(resultAmount, uIntMaxAsString);
  });

  it('fails comet.allow bad from address', async function () {
    const errorMessage = 'Compound Comet [allow] | Argument `manager` is not a string or is an invalid address.';
    let resultError;

    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    // Allow a manager within Comet
    let receipt;
    try {
      const trx = await comet.allow(
        null,
        false
      );
      receipt = await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);
  });

  it('runs comet.transfer from manager', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    const compoundMyManager = new Compound(providerUrl, {
      privateKey: acc2.privateKey
    });

    // First, seed the account with USDC using Compound v2
    const supplyEthTrx = await compound.supply(Compound.ETH, 5);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.USDC, 1000, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    // supply USDC to Comet
    const trx1 = await comet.supply(
      compound._provider.address, // from me
      compound._provider.address, // to me
      Compound.USDC,
      10,
    );
    await trx1.wait(1);

    // enable a manager address
    const trx2 = await comet.allow(
      compoundMyManager._provider.address,
      true
    );
    await trx2.wait(1);

    const cometMyManager = compoundMyManager.comet.MAINNET_USDC();

    // Transfer within Comet
    let receipt;
    try {
      const trx = await cometMyManager.transfer(
        compound._provider.address, // has already enabled the manager
        '0x1111111111111111111111111111111111111111',
        Compound.USDC,
        1,
        { gasLimit: '5000000' }
      );
      receipt = await trx.wait(1);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('runs comet.transfer from self', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    // First, seed the account with USDC using Compound v2
    const supplyEthTrx = await compound.supply(Compound.ETH, 5);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.USDC, 1000, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    // supply USDC to Comet
    const trx1 = await comet.supply(
      compound._provider.address, // from me
      compound._provider.address, // to me
      Compound.USDC,
      10,
    );
    await trx1.wait(1);

    // Transfer within Comet
    let receipt;
    try {
      const trx = await comet.transfer(
        true,
        '0x1111111111111111111111111111111111111111',
        Compound.USDC,
        1,
      );
      receipt = await trx.wait(1);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('fails comet.transfer bad input', async function () {
    let errorMessage = 'Compound Comet [transfer] | Argument `src` is invalid.';
    let resultError;

    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    // Transfer within Comet
    let receipt;
    try {
      const trx = await comet.transfer(
        false,
        '0x1111111111111111111111111111111111111111',
        Compound.USDC,
        1,
      );
      receipt = await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);

    errorMessage = 'Compound Comet [transfer] | Argument `dst` is not a string or is an invalid address.';
    try {
      const trx = await comet.transfer(
        '0x1111111111111111111111111111111111111111',
        '0xx',
        Compound.USDC,
        1,
      );
      receipt = await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);

    errorMessage = 'Compound Comet [transfer] | Argument `asset` cannot be transferred.';
    try {
      const trx = await comet.transfer(
        '0x1231231231231231231231231231231231231231',
        '0x1111111111111111111111111111111111111111',
        'xxxx',
        1,
      );
      receipt = await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);

    errorMessage = 'Compound Comet [transfer] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await comet.transfer(
        true,
        '0x1111111111111111111111111111111111111111',
        Compound.USDC,
        null,
      );
      receipt = await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);
  });

  it('runs comet.withdraw successfully', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    // First, seed the account with WBTC using Compound v2
    const supplyEthTrx = await compound.supply(Compound.ETH, 30);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.WBTC, 1, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    // supply WBTC collateral to Comet
    const trx1 = await comet.supply(
      compound._provider.address, // from me
      compound._provider.address, // to me
      Compound.WBTC,
      0.5,
    );
    await trx1.wait(1);

    // withdraw an asset from Comet
    let receipt;
    try {
      const trx = await comet.withdraw(
        Compound.USDC,
        1005,
        { gasLimit: '5000000' }
      );
      receipt = await trx.wait(1);
    } catch (e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('runs comet.withdrawTo successfully', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    // First, seed the account with WBTC using Compound v2
    const supplyEthTrx = await compound.supply(Compound.ETH, 30);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.WBTC, 1, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    // supply wbtc collateral to Comet
    const trx1 = await comet.supply(
      compound._provider.address, // from me
      compound._provider.address, // to me
      Compound.WBTC,
      0.5,
      { gasLimit: '5000000' }
    );
    await trx1.wait(1);

    // withdraw an asset from Comet
    let receipt;
    try {
      const trx = await comet.withdrawTo(
        '0x1231231231231231231231231231231231231231',
        Compound.USDC,
        1005,
        { gasLimit: '5000000' }
      );
      receipt = await trx.wait(1);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('runs comet.withdrawFrom successfully', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    const compoundMyManager = new Compound(providerUrl, {
      privateKey: acc2.privateKey
    });

    // First, seed the account with WBTC using Compound v2
    const supplyEthTrx = await compound.supply(Compound.ETH, 30);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await compound.borrow(Compound.WBTC, 1, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    // supply USDC to Comet
    const trx1 = await comet.supply(
      compound._provider.address, // from me
      compound._provider.address, // to me
      Compound.WBTC,
      0.5,
    );
    await trx1.wait(1);

    // enable a manager address
    const trx2 = await comet.allow(
      compoundMyManager._provider.address,
      true
    );
    await trx2.wait(1);

    const cometMyManager = compoundMyManager.comet.MAINNET_USDC();

    // withdraw an asset from Comet
    let receipt;
    try {
      const trx = await cometMyManager.withdrawFrom(
        compound._provider.address,
        '0x1111111111111111111111111111111111111111',
        Compound.WBTC,
        0.25,
        { gasLimit: '5000000' }
      );
      receipt = await trx.wait(1);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('fails comet withdraw, bad input', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const comet = compound.comet.MAINNET_USDC();

    errorMessage = 'Compound Comet [withdrawFrom] | Argument `src` is not a string or is an invalid address.';
    try {
      const trx = await comet.withdrawFrom(
        null,
        '0x1111111111111111111111111111111111111111',
        Compound.USDC,
        100,
      );
      await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);

    errorMessage = 'Compound Comet [withdrawFrom] | Argument `dst` is not a string or is an invalid address.';
    try {
      const trx = await comet.withdrawFrom(
        '0x1111111111111111111111111111111111111111',
        null,
        Compound.USDC,
        100,
      );
      await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);

    errorMessage = 'Compound Comet [withdrawFrom] | Argument `asset` cannot be withdrawn.';
    try {
      const trx = await comet.withdrawFrom(
        '0x1111111111111111111111111111111111111111',
        '0x1231231231231231231231231231231231231231',
        'xxxx',
        100,
      );
      await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);

    errorMessage = 'Compound Comet [withdrawFrom] | Argument `amount` must be a string, number, or BigNumber.';
    try {
      const trx = await comet.withdrawFrom(
        '0x1111111111111111111111111111111111111111',
        '0x1231231231231231231231231231231231231231',
        Compound.USDC,
        null,
      );
      await trx.wait(1);
    } catch (e) {
      resultError = e.message;
    }

    assert.equal(resultError, errorMessage);
  });

  it('runs comet.buyCollateral', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const anotherAccount = new Compound(providerUrl, {
      privateKey: acc2.privateKey
    });

    const me = compound._provider.address;
    const another = anotherAccount._provider.address;

    // First, seed the ANOTHER with WBTC using Compound v2
    const supplyEthTrx = await anotherAccount.supply(Compound.ETH, 30);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await anotherAccount.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await anotherAccount.borrow(Compound.WBTC, 1, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    // Next, seed the ME account with USDC using Compound v2
    const supplyEthTrx2 = await compound.supply(Compound.ETH, 5);
    await supplyEthTrx2.wait(1);

    const enterEthMarket2 = await compound.enterMarkets(Compound.ETH);
    await enterEthMarket2.wait(1);

    const borrowUsdcTrx2 = await compound.borrow(Compound.USDC, 1000, { gasLimit: 600000 });
    await borrowUsdcTrx2.wait(1);

    const cometAddress = Compound.util.getAddress(Compound.Comet, Compound.MAINNET_USDC);

    // Direct transfer WBTC to Comet so it can sell it
    // Don't do this in practice, the way to make collateral available
    // to be purchased via `buyCollateral` is after an account absorption
    const token = new ethers.Contract(
      Compound.util.getAddress(Compound.WBTC),
      ['function transfer(address, uint)'],
      new ethers.Wallet(acc2.privateKey, new ethers.providers.JsonRpcProvider(providerUrl))
    );

    const trx1 = await token.transfer(
      cometAddress,
      (0.5 * 1e8).toString()
    );
    await trx1.wait(1);

    const comet = compound.comet.MAINNET_USDC();

    let receipt;
    try {
      const trx = await comet.buyCollateral(
        Compound.WBTC,
        0.0001, //  $2.39 of WBTC
        50,     // $50.00 of USDC
        me,
        false,
        { gasLimit: '5000000' }
      );
      receipt = await trx.wait(1);
    } catch (e) {
      console.log(e);
      throw Error(JSON.stringify(e));
    }
  });

  it('runs comet.getSupplyRate', async function () {
    try {
      const compound = new Compound(providerUrl, {
        privateKey: acc1.privateKey
      });
      const comet = compound.comet.MAINNET_USDC();

      const utilization = +(await comet.getUtilization());
      const supplyRate = +(await comet.getSupplyRate(utilization));
      const isNumber = typeof supplyRate === 'number' && !isNaN(supplyRate);

      assert.equal(isNumber, true);
    } catch(e) {
      console.error(e, JSON.stringify(e));
      throw Error(e);
    }
  });

  it('runs comet.getBorrowRate', async function () {
    try {
      const compound = new Compound(providerUrl, {
        privateKey: acc1.privateKey
      });
      const comet = compound.comet.MAINNET_USDC();

      const utilization = +(await comet.getUtilization());
      const borrowRate = +(await comet.getBorrowRate(utilization));
      const isNumber = typeof borrowRate === 'number' && !isNaN(borrowRate);

      assert.equal(isNumber, true);
    } catch(e) {
      console.error(e, JSON.stringify(e));
      throw Error(e);
    }
  });

  it('runs comet.getUtilization', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });
    const comet = compound.comet.MAINNET_USDC();

    const utilization = +(await comet.getUtilization());
    const isNumber = typeof utilization === 'number' && !isNaN(utilization);

    assert.equal(isNumber, true);
  });

  it('runs comet.absorb account successfully', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: acc1.privateKey
    });

    const insolventAccount = new Compound(providerUrl, {
      privateKey: acc2.privateKey
    });

    // First, seed the account with WBTC using Compound v2
    const supplyEthTrx = await insolventAccount.supply(Compound.ETH, 30);
    await supplyEthTrx.wait(1);

    const enterEthMarket = await insolventAccount.enterMarkets(Compound.ETH);
    await enterEthMarket.wait(1);

    const borrowUsdcTrx = await insolventAccount.borrow(Compound.WBTC, 1, { gasLimit: 600000 });
    await borrowUsdcTrx.wait(1);

    const comet = insolventAccount.comet.MAINNET_USDC();

    // setting up the underwater account
    price = +(await comet.getPrice(Compound.WBTC));

    info = await comet.getAssetInfoBySymbol(Compound.WBTC);

    // supply wbtc collateral to Comet
    const trx1 = await comet.supply(
      insolventAccount._provider.address, // from me
      insolventAccount._provider.address, // to me
      Compound.WBTC,
      0.5,
    );
    await trx1.wait(1);

    // borrow base from Comet
    try {
      const trx2 = await comet.withdraw(
        Compound.USDC,
        6000,
        { gasLimit: '5000000' }
      );
      await trx2.wait(1);
    } catch(e) {
      console.error(e, JSON.stringify(e));
    }

    await advanceBlockHeight(5);

    const timestamp = ((await compound._provider.provider.getBlock()).timestamp);
    await setNextBlockTimestamp(timestamp + 10000000000); // >300 years

    const _comet = compound.comet.MAINNET_USDC();

    // Absorb an underwater account
    let receipt;
    try {
      const trx = await _comet.absorb(
        compound._provider.address, // absorber
        [ insolventAccount._provider.address ],
        { gasLimit: '5000000' }
      );
      receipt = await trx.wait(1);
    } catch (e) {
      console.error(JSON.stringify(e));
      throw Error(JSON.stringify(e));
    }

    const success = receipt.events.findIndex(_ => _.event === 'AbsorbCollateral') > -1 &&
      receipt.events.findIndex(_ => _.event === 'AbsorbDebt') > -1;

    assert.equal(success, true);
  });

  it('runs comet.getReserves', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();
    const reserves = +(await comet.getReserves());
    const isNumber = typeof reserves === 'number' && !isNaN(reserves);

    assert.equal(isNumber, true);
  });

  it('runs comet.targetReserves', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();
    const reserves = +(await comet.targetReserves());
    const isNumber = typeof reserves === 'number' && !isNaN(reserves);

    assert.equal(isNumber, true);
  });

  it('runs comet.isBorrowCollateralized', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();
    let isCollateralized;

    try {
      isCollateralized = await comet.isBorrowCollateralized(
        '0x1111111111111111111111111111111111111111'
      );
    } catch (e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    // if an account is borrowing $0, it is technically collateralized
    assert.equal(isCollateralized, true, 'this should be true');
  });

  it('runs comet.isLiquidatable', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    const isLiquidatable = await comet.isLiquidatable(
      '0x1111111111111111111111111111111111111111'
    );

    assert.equal(isLiquidatable, false);
  });

  it('runs comet.getPrice', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    let price;
    try {
      price = +(await comet.getPrice(Compound.USDC));
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }
    const isNumber = typeof price === 'number' && !isNaN(price);

    assert.equal(isNumber, true);
  });

  it('runs comet.getAssetInfoByAddress', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    const compAddress = '0xc00e94Cb662C3520282E6f5717214004A7f26888'; // Mainnet ETH COMP
    let info;
    try {
      info = await comet.getAssetInfoByAddress(compAddress);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(info.asset, compAddress);
  });

  it('runs comet.getAssetInfo for 0th asset', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    const compAddress = '0xc00e94Cb662C3520282E6f5717214004A7f26888'; // Mainnet ETH COMP
    let info;
    try {
      info = await comet.getAssetInfo(0);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(info.asset, compAddress);
  });

  it('runs comet.getAssetInfoBySymbol COMP', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    const compAddress = '0xc00e94Cb662C3520282E6f5717214004A7f26888'; // Mainnet ETH COMP
    let info;
    try {
      info = await comet.getAssetInfoBySymbol(Compound.COMP);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(info.asset, compAddress);
  });

  it('runs comet.borrowBalanceOf', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    let bal;
    try {
      bal = await comet.borrowBalanceOf(acc1.address);
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(+(bal).toString(), '0');
  });

  it('runs comet.quoteCollateral', async function () {
    const compound = new Compound(providerUrl);
    const comet = compound.comet.MAINNET_USDC();

    let quote;
    try {
      quote = await comet.quoteCollateral(
        Compound.WBTC,
        1000
      );
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal((quote).toString(), '3820187');
  });

  it('runs comet.getBaseAssetName', async function () {
    let name;
    try {
      name = await Compound.comet.getBaseAssetName();
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(name, 'USDC');
  });

  it('runs comet.getSupportedCollaterals', async function () {
    const expected = '["COMP","WBTC","WETH","UNI","LINK","USDC"]';
    let collaterals;
    try {
      collaterals = await Compound.comet.getSupportedCollaterals();
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(JSON.stringify(collaterals), expected);
  });

  it('runs comet.getSupportedDeployments', async function () {
    const expected = '["mainnet_usdc","mainnet_weth","polygon_usdc","arbitrum_usdc","base_usdbc","base_weth","goerli_usdc","goerli_weth","mumbai_usdc","goerli_arbitrum_usdc","goerli_optimism_usdc","goerli_base_usdc","goerli_base_weth","fuji_usdc"]';
    let nets;
    try {
      nets = Compound.comet.getSupportedDeployments();
    } catch(e) {
      console.error(e);
      throw Error(JSON.stringify(e));
    }

    assert.equal(JSON.stringify(nets), expected);
  });
}

async function advanceBlockHeight(blocks) {
  const txns = [];
  for (let i = 0; i < blocks; i++) {
    txns.push(hre.network.provider.send('evm_mine'));
  }
  await Promise.all(txns);
}

async function setNextBlockTimestamp(ts) {
  await hre.network.provider.send('evm_setNextBlockTimestamp', [ts]);
  await hre.network.provider.send('evm_mine');
}
