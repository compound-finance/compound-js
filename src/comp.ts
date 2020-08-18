import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { address, abi } from './constants';

const keccak256 = ethers.utils.keccak256;

/**
 * Applies the EIP-55 checksum to an Ethereum address.
 *
 * @param {String} _address The address in which to find the COMP balance.
 *
 * @returns {string} Returns a string of the Ethereum address.
 */
function toChecksumAddress(_address) {
  const chars = _address.toLowerCase().substring(2).split('');
  const expanded = new Uint8Array(40);
  for (let i = 0; i < 40; i++) {
    expanded[i] = chars[i].charCodeAt(0);
  }

  let hash = keccak256(expanded);
  let ret = '';

  for (let i = 0; i < _address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += _address[i].toUpperCase();
    } else {
      ret += _address[i];
    }
  }

  return ret;
}

/**
 * Get the balance of COMP tokens held by an address.
 *
 * @param {String} _address The address in which to find the COMP balance.
 *
 * @returns {string} Returns a string of the numeric balance of COMP.
 */
export async function getCompBalance(_address: string, _provider: string='mainnet') {
  const provider = await eth.createProvider({ provider: _provider });
  const net = await eth.getProviderNetwork(provider);

  const errorPrefix = 'Compound [getCompBalance] | ';

  if (typeof _address !== 'string') {
    throw Error(errorPrefix + 'Argument `address` must be a string.');
  }

  try {
    _address = toChecksumAddress(_address);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `address` must be a valid Ethereum address.');
  }

  const compAddress = address[net.name].COMP;
  const parameters = [ _address ];
  const trxOptions: any = {
    _compoundProvider: provider,
    abi: abi.COMP,
  };

  const result = await eth.read(compAddress, 'balanceOf', parameters, trxOptions);
  return result.toString();
}
