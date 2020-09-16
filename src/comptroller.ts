/**
 * @file Comptroller
 * @desc These methods facilitate interactions with the Comptroller smart
 *     contract.
 */

import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { constants, address, abi, cTokens } from './constants';

/**
 * Enters the user's address into Compound Protocol markets.
 *
 * @param {any[]} markets An array of strings of markets to enter, meaning use
 *     those supplied assets as collateral.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the enterMarkets
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * 
 * (async function () {
 *   const trx = await compound.enterMarkets(Compound.ETH); // Use [] for multiple
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function enterMarkets(markets: any = [], options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [enterMarkets] | ';

  if (typeof markets === 'string') {
    markets = [ markets ];
  }

  if (!Array.isArray(markets)) {
    throw Error(errorPrefix + 'Argument `markets` must be an array or string.');
  }

  const addresses = [];
  for (let i = 0; i < markets.length; i++) {
    if (markets[i][0] !== 'c') {
      markets[i] = 'c' + markets[i];
    }

    if (!cTokens.includes(markets[i])) {
      throw Error(errorPrefix + 'Provided market `' + markets[i] + '` is not a recognized cToken.');
    }

    addresses.push(address[this._network.name][markets[i]]);
  }

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ addresses ];

  options._compoundProvider = this._provider;
  options.abi = abi.Comptroller;

  return eth.trx(comptrollerAddress, 'enterMarkets', parameters, options);
}

/**
 * Exits the user's address from a Compound Protocol market.
 *
 * @param {string} market A string of the symbol of the market to exit.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `mint` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the exitMarket
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * 
 * (async function () {
 *   const trx = await compound.exitMarket(Compound.ETH);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function exitMarket(market: string, options: any = {}) {
  await netId(this);
  const errorPrefix = 'Compound [exitMarkets] | ';

  if (typeof market !== 'string' || market === '') {
    throw Error(errorPrefix + 'Argument `market` must be a string of a cToken market name.');
  }

  if (market[0] !== 'c') {
    market = 'c' + market;
  }

  if (!cTokens.includes(market)) {
    throw Error(errorPrefix + 'Provided market `' + market + '` is not a recognized cToken.');
  }

  const cTokenAddress = address[this._network.name][market];

  const comptrollerAddress = address[this._network.name].Comptroller;
  const parameters = [ cTokenAddress ];

  options._compoundProvider = this._provider;
  options.abi = abi.Comptroller;

  return eth.trx(comptrollerAddress, 'exitMarket', parameters, options);
}
