/**
 * @file Compound
 * @desc This file defines the constructor of the `Compound` class.
 * @hidden
 */

import { ethers } from 'ethers';
import * as comet from './comet';
import * as comp from './comp';
import * as comptroller from './comptroller';
import * as cToken from './cToken';
import * as eth from './eth';
import * as gov from './gov';
import * as priceFeed from './priceFeed';
import * as util from './util';
import { constants, decimals } from './constants';
import { Provider, CompoundOptions, CompoundInstance } from './types';

// Turn off Ethers.js warnings
ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

/**
 * Creates an instance of the Compound.js SDK.
 *
 * @param {Provider | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {object} [options] Optional provider options.
 *
 * @example
 *
 * ```
 * var compound = new Compound(window.ethereum); // web browser
 * 
 * var compound = new Compound('http://127.0.0.1:8545'); // HTTP provider
 * 
 * var compound = new Compound(); // Uses Ethers.js fallback mainnet (for testing only)
 * 
 * var compound = new Compound('goerli'); // Uses Ethers.js fallback (for testing only)
 * 
 * // Init with private key (server side)
 * var compound = new Compound('https://mainnet.infura.io/v3/_your_project_id_', {
 *   privateKey: '0x_your_private_key_', // preferably with environment variable
 * });
 * 
 * // Init with HD mnemonic (server side)
 * var compound = new Compound('mainnet' {
 *   mnemonic: 'clutch captain shoe...', // preferably with environment variable
 * });
 * ```
 *
 * @returns {object} Returns an instance of the Compound.js SDK.
 */
const Compound = function(
  provider: Provider | string = 'mainnet', options: CompoundOptions = {}
) : CompoundInstance {
  const originalProvider = provider;

  options.provider = provider || options.provider;
  provider = eth._createProvider(options);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance: any = {
    _originalProvider: originalProvider,
    _provider: provider,
    ...comptroller,
    ...cToken,
    ...gov,
    ...priceFeed,
    claimComp: comp.claimComp,
    delegate: comp.delegate,
    delegateBySig: comp.delegateBySig,
    createDelegateSignature: comp.createDelegateSignature,
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {
    delete instance._networkPromise;
    instance._network = network;
  });

  instance.comet = {
    _compoundInstance: instance,
    absorb: comet.absorb,
    allow: comet.allow,
    allowBySig: comet.allowBySig,
    buyCollateral: comet.buyCollateral,
    createAllowSignature: comet.createAllowSignature,
    supply: comet.supply,
    transfer: comet.transfer,
    withdraw: comet.withdraw,
    withdrawFrom: comet.withdrawFrom,
    withdrawTo: comet.withdrawTo,
  };

  return instance;
};

Compound.eth = eth;
Compound.util = util;
Compound._ethers = ethers;
Compound.decimals = decimals;
Compound.comp = {
  getCompAccrued: comp.getCompAccrued,
  getCompBalance: comp.getCompBalance,
};
Compound.comet = {
  borrowBalanceOf: comet.borrowBalanceOf,
  collateralBalanceOf: comet.collateralBalanceOf,
  getAssetInfo: comet.getAssetInfo,
  getAssetInfoByAddress: comet.getAssetInfoByAddress,
  getAssetInfoBySymbol: comet.getAssetInfoBySymbol,
  getBaseAssetName: comet.getBaseAssetName,
  getBorrowRate: comet.getBorrowRate,
  getPrice: comet.getPrice,
  getReserves: comet.getReserves,
  getSupplyRate: comet.getSupplyRate,
  getSupportedCollaterals: comet.getSupportedCollaterals,
  getSupportedNetworkNames: comet.getSupportedNetworkNames,
  getUtilization: comet.getUtilization,
  isBorrowCollateralized: comet.isBorrowCollateralized,
  isLiquidatable: comet.isLiquidatable,
  quoteCollateral: comet.quoteCollateral,
  targetReserves: comet.targetReserves,
};
Object.assign(Compound, constants);

export = Compound;
