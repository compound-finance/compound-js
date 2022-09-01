import { ethers } from 'ethers';
import { CompoundInstance } from './types';

/**
 * This function acts like a decorator for all methods that interact with the
 *     blockchain. In order to use the correct Compound Protocol addresses, the
 *     Compound.js SDK must know which network its provider points to. This
 *     function holds up a transaction until the main constructor has determined
 *     the network ID.
 *
 * @hidden
 *
 * @param {Compound} _compound The instance of the Compound.js SDK.
 *
 */
export async function netId(_compound: CompoundInstance): Promise<void> {
  if (_compound._networkPromise) {
    await _compound._networkPromise;
  }
}

const keccak256 = ethers.utils.keccak256;

/**
 * Applies the EIP-55 checksum to an Ethereum address.
 *
 * @hidden
 *
 * @param {string} _address The Ethereum address to apply the checksum.
 *
 * @returns {string} Returns a string of the Ethereum address.
 */
export function toChecksumAddress(_address: string): string {
  const chars = _address.toLowerCase().substring(2).split('');
  const expanded = new Uint8Array(40);

  for (let i = 0; i < 40; i++) {
    expanded[i] = chars[i].charCodeAt(0);
  }

  const hash = keccak256(expanded);
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
