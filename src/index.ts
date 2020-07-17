import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
import * as cToken from './cToken';
import { constants } from './constants';

const Compound = function(provider: any='mainnet', options: any={}) {
  options.provider = provider || options.provider;
  provider = eth.createProvider(options);

  const instance: any = {
    _ethers: ethers,
    _provider: provider,
    ...cToken
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
Object.assign(Compound, constants);

export = Compound;
