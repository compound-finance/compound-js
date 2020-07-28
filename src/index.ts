import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
import * as comptroller from './comptroller';
import * as cToken from './cToken';
import * as priceOracle from './priceOracle';
import { constants } from './constants';

// ethers.utils.Logger.setLogLevel('off'); // turn off warnings

const Compound = function(provider: any='mainnet', options: any={}) {
  options.provider = provider || options.provider;
  provider = eth.createProvider(options);

  const instance: any = {
    _provider: provider,
    ...comptroller,
    ...cToken,
    ...priceOracle,
  };

  // Instance needs to know which network the provider connects to, so it can
  //     use the correct contract addresses.
  instance._networkPromise = eth.getProviderNetwork(provider).then((network) => {
    delete instance._networkPromise;
    instance._network = network;
  });

  return instance;
};

Compound.eth = eth;
Compound.util = util;
Compound._ethers = ethers;
Object.assign(Compound, constants);

export = Compound;
