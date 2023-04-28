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
import { constants, cometConstants, decimals } from './constants';
import { Provider, CompoundOptions, CompoundInstance, CometInstance } from './types';

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
 * Compound III (Comet) Object Initialization. This accepts the same parameters 
 *     as the `Compound` constructor. An error will be thrown initially and 
 *     whenever a method is called if the provider does not match the network of
 *     the specific Comet deployment. The SDK constants as well as a method in 
 *     the Comet documentation note the Comet deployments that Compound.js 
 *     supports.
 * 
 * ```
 * var compound = new Compound(window.ethereum);
 * var comet = compound.comet.MAINNET_USDC(); // provider from `compound` will be used unless on is explicitly passed
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
  instance._networkPromise = eth.getProviderNetwork(provider).then((_network) => {
    delete instance._networkPromise;
    instance._network = _network;
  });

  instance.comet = {};
  const comets = comet.getSupportedDeployments();
  comets.forEach((_comet) => {
    const cometReference = _comet.toUpperCase();
    instance.comet[cometReference] = function(
        _provider: Provider = instance._provider, _options: CompoundOptions = {}
      ) : CometInstance {
        const _originalProvider = _provider;

        _options.provider = _provider || _options.provider;
        _provider = eth._createProvider(_options);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cometInstance: any = {
          _originalProvider,
          _provider,
          _invalidProvider: false,
          _cometDeploymentName: _comet,
        };

        Object.keys(comet).forEach((method) => {
          cometInstance[method] = comet[method];
        });

        function disableCometConnection(error) {
          console.error(error);

          // All Comet methods will throw an error when called if this flag is set
          cometInstance._invalidProvider = error;
        }

        cometInstance._networkPromise = eth.getProviderNetwork(_provider).then((_network) => {

          delete cometInstance._networkPromise;
          cometInstance._network = _network;

          // Throws an error if the Chain ID is not compatible
          util.getNetNameWithChainId(_network.id);

          if (cometConstants.instanceNetworkMap[_comet] !== _network.name) {
            disableCometConnection('Compound.js Comet constructor was passed a provider that is not compatible with the selected Comet instance.');
          }
        });

        return cometInstance;
      }
  });

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
  getSupportedDeployments: comet.getSupportedDeployments,
  getSupportedCollaterals: comet.getSupportedCollaterals,
  getBaseAssetName: comet.getBaseAssetName,
}
Object.assign(Compound, constants);

export = Compound;
