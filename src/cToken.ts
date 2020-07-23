import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { constants, address, abi, decimals, underlyings, cTokens } from './constants';

export async function supply(asset: string, amount: any, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [supply] | ';

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  if (!cTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be supplied.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = { _compoundProvider: this._provider };
  const parameters = [];
  if (cTokenName === constants.cETH) {
    trxOptions.value = amount;
    trxOptions.abi = abi.cEther;
  } else {
    parameters.push(amount);
    trxOptions.abi = abi.cErc20;
  }

  return eth.trx(cTokenAddress, 'mint', parameters, trxOptions);
}

export async function redeem(asset: string, amount: any, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [redeem] | ';

  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `asset` must be a non-empty string.');
  }

  const passedCToken = asset[0] === 'c';

  const cTokenName = passedCToken ? asset : 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  const underlyingName = passedCToken ? asset.slice(1 ,asset.length) : asset;
  const underlyingAddress = address[this._network.name][underlyingName];

  if (!cTokens.includes(cTokenName) || !underlyings.includes(underlyingName)) {
    throw Error(errorPrefix + 'Argument `asset` is not supported.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = {
    _compoundProvider: this._provider,
    abi: cTokenName === constants.cETH ? abi.cEther : abi.cErc20,
  };
  const parameters = [ amount ];
  const method = passedCToken ? 'redeem' : 'redeemUnderlying';

  return eth.trx(cTokenAddress, method, parameters, trxOptions);
}

export async function borrow(asset: string, amount: any, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [borrow] | ';

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  if (!cTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be borrowed.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = { _compoundProvider: this._provider, ...options };
  const parameters = [ amount ];
  trxOptions.abi = cTokenName === constants.cETH ? abi.cEther : abi.cErc20;

  return eth.trx(cTokenAddress, 'borrow', parameters, trxOptions);
}

export async function repayBorrow(asset: string, amount: any, borrower: string, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [repayBorrow] | ';

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  if (!cTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` is not supported.');
  }

  if (
    typeof amount !== 'number' &&
    typeof amount !== 'string' &&
    !ethers.BigNumber.isBigNumber(amount)
  ) {
    throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
  }

  let method = ethers.utils.isAddress(borrower) ? 'repayBorrowBehalf' : 'repayBorrow';
  if (borrower && method === 'repayBorrow') {
    throw Error(errorPrefix + 'Invalid `borrower` address.');
  }

  if (!options.mantissa) {
    amount = +amount;
    amount = amount * Math.pow(10, decimals[asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  const trxOptions: any = { _compoundProvider: this._provider, ...options };
  const parameters = method === 'repayBorrowBehalf' ? [ borrower ] : [];
  if (cTokenName === constants.cETH) {
    trxOptions.value = amount;
    trxOptions.abi = abi.cEther;
  } else {
    parameters.push(amount);
    trxOptions.abi = abi.cErc20;

    // ERC-20 approve transaction
    const underlyingAddress = address[this._network.name][asset];
    await eth.trx(
      underlyingAddress,
      'approve',
      [ cTokenAddress, amount ],
      { _compoundProvider: this._provider, abi: abi.cErc20 }
    );
  }

  return eth.trx(cTokenAddress, method, parameters, trxOptions);
}
