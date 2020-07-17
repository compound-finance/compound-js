import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { constants, address, abi, decimals, underlyings } from './constants';

export async function supply(asset: string, amount: any, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [supply] | ';

  const cTokenName = 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  if (!cTokenAddress || !underlyings.includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` is not a recognized cToken address.');
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
  };
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
