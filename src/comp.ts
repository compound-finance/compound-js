import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { address, abi } from './constants';

const keccak256 = ethers.utils.keccak256;

/**
 * Applies the EIP-55 checksum to an Ethereum address.
 *
 * @param {string} _address The Ethereum address to apply the checksum.
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
 * @param {string} _address The address in which to find the COMP balance.
 * @param {string} _provider A valid Ethereum provider string.
 *
 * @returns {string} Returns a string of the numeric balance of COMP. The value
 *     is scaled up by 18 decimal places.
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

/**
 * Get the amount of COMP tokens accrued but not yet claimed by an address.
 *
 * @param {string} _address The address in which to find the COMP accrued.
 * @param {string} _provider A valid Ethereum provider string.
 *
 * @returns {string} Returns a string of the numeric accruement of COMP. The
 *     value is scaled up by 18 decimal places.
 */
export async function getCompAccrued(_address: string, _provider: string='mainnet') {
  const provider = await eth.createProvider({ provider: _provider });
  const net = await eth.getProviderNetwork(provider);

  const errorPrefix = 'Compound [getCompAccrued] | ';

  if (typeof _address !== 'string') {
    throw Error(errorPrefix + 'Argument `address` must be a string.');
  }

  try {
    _address = toChecksumAddress(_address);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `address` must be a valid Ethereum address.');
  }

  const lensAddress = address[net.name].CompoundLens;
  const compAddress = address[net.name].COMP;
  const comptrollerAddress = address[net.name].Comptroller;
  const parameters = [ compAddress, comptrollerAddress, _address ];
  const trxOptions: any = {
    _compoundProvider: provider,
    abi: abi.CompoundLens,
  };

  const result = await eth.read(lensAddress, 'getCompBalanceMetadataExt', parameters, trxOptions);
  return result.allocated.toString();
}

/**
 * Create a transaction to claim accrued COMP tokens for the user.
 *
 * @returns {object} Returns an Ethers.js transaction object of the vote
 *     transaction.
 */
export async function claimComp(options: any = {}) {
  await netId(this);

  const errorPrefix = 'Compound [claimComp] | ';

  const userAddress = this._provider.address;
  const comptrollerAddress = address[this._network.name].Comptroller;
  const trxOptions: any = options;
  trxOptions._compoundProvider = this._provider;
  // trxOptions.abi = [ 'function claimComp(address)' ]; // Ethers does not like the Comptroller ABI for some reason.
  trxOptions.abi = abi.Comptroller;
  const parameters = [ userAddress ];
  const method = 'claimComp(address)';

  return eth.trx(comptrollerAddress, method, parameters, trxOptions);
}
