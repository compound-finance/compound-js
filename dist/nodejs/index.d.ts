import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
/**
 * Creates an instance of the Compound.js SDK.
 *
 * @param {any{} | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {any{}} [options] Optional provider options.
 *
 * @returns {object} Returns an instance of Compound.js SDK.
 */
declare const Compound: {
    (provider?: any, options?: any): any;
    eth: typeof eth;
    util: typeof util;
    _ethers: typeof ethers;
};
export = Compound;
