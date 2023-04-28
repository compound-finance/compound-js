/**
 * @file Comet
 * @desc These methods facilitate interactions with Compound III.
 */

import { ethers } from 'ethers';
import * as eth from './eth';
import { netId, toChecksumAddress } from './helpers';
import { sign } from './EIP712';
import { constants, cometConstants, abi } from './constants';
const { address, decimals, collaterals, base } = cometConstants;

import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import {
  AllowSignatureMessage,
  AllowTypes,
  AssetInfo,
  CallOptions,
  CometInstance,
  EIP712Domain,
  Signature,
  TrxResponse,
} from './types';

function isValidEthereumAddress(_address: string): boolean {
  let result = true;

  if (
    typeof _address !== 'string' ||
    _address.length !== 42 ||
    !_address.startsWith('0x')
  ) {
    result = false;
  }

  return result;
}

async function checkValidCometProvider(comet: CometInstance): Promise<void> {
  await netId(comet);
  if (typeof comet._invalidProvider === 'string') {
    throw Error(comet._invalidProvider);
  }
}

/**
 * Supplies the user's Ethereum asset to Compound Comet.
 *
 * @param {string} from A string of the address that the supplied asset is 
 *     supplied from. This allows approved account managers to supply on behalf 
 *     of an account that has already approved their ERC-20 asset to be 
 *     transferred to the Comet contract. To supply on behalf of the sender, 
 *     this should be set to the sender's address.
 * @param {string} dst A string of the address that the supplied asset is 
 *     credited to within Comet. To supply to the sender's account, this should 
 *     be set to the sender's address.
 * @param {string} asset A string of the name of the asset to supply.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to supply. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there 
 *     are no decimals) or in its natural scale.
 * @param {boolean} noApprove Explicitly prevent this method from attempting an 
 *     ERC-20 `approve` transaction prior to sending the `supply` transaction.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction. A passed `gasLimit` will be used in both the `approve` (if 
 *     not supressed) and `supply` transactions.
 *
 * @returns {object} Returns an Ethers.js transaction object of the supply
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 *
 * // Ethers.js overrides are an optional last parameter
 * // const trxOptions = { gasLimit: 250000, mantissa: false };
 * 
 * (async function() {
 * 
 *   const me = '0xSenderAddress'; // can be compound._provider.address
 * 
 *   console.log('Supplying ETH to Compound Comet...');
 *   const trx = await comet.supply(
 *     me, // supplied asset comes from this account
 *     me, // supplied asset is credited to this account's balance
 *     Compound.WBTC,
 *     3
 *   );
 *   console.log('Ethers.js transaction object', trx);
 * 
 * })().catch(console.error);
 * ```
 */
export async function supply(
  from: string,
  dst: string,
  asset: string,
  amount: string | number | BigNumber,
  noApprove = false,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await checkValidCometProvider(this);
  const errorPrefix = 'Compound Comet [supply] | ';

  const cometAddress = address[this._cometDeploymentName][constants.Comet];
  let assetAddress;
  try { assetAddress = address[this._cometDeploymentName][asset].contract }
  catch(e) {}

  if (!isValidEthereumAddress(from)) {
    throw Error(errorPrefix + 'Argument `from` is not a string or is an invalid address.');
  }

  if (!isValidEthereumAddress(dst)) {
    throw Error(errorPrefix + 'Argument `dst` is not a string or is an invalid address.');
  }

  if (!assetAddress || !collaterals[this._cometDeploymentName].includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be supplied.');
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
    amount = amount * Math.pow(10, decimals[this._cometDeploymentName][asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  options.abi = abi.Erc20;
  options._compoundProvider = this._provider;

  if (noApprove !== true) {
    let userAddress = this._provider.address;

    if (!userAddress && this._provider.getAddress) {
      userAddress = await this._provider.getAddress();
    }

    // Check allowance
    const allowance = await eth.read(
      assetAddress,
      'allowance',
      [ userAddress, cometAddress ],
      options
    );

    const notEnough = allowance.lt(amount);

    if (notEnough) {
      // ERC-20 approve transaction
      await eth.trx(
        assetAddress,
        'approve',
        [ cometAddress, amount ],
        options
      );
    }
  }

  options.abi = abi.Comet;
  const parameters = [ from, dst, assetAddress, amount ];

  return eth.trx(cometAddress, 'supplyFrom', parameters, options);
}

/**
 * Allows or disallows an address to withdraw or transfer on behalf of the
 *     Sender's address.
 *
 * @param {string} manager The address of the manager.
 * @param {boolean} isAllowed True to add the manager and false to remove the
 *     manager.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the allow
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const address = '0xManagerAddressHere';
 *   const trx = await comet.allow(address, true);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function allow(
  manager: string,
  isAllowed: boolean,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await checkValidCometProvider(this);
  const errorPrefix = 'Compound Comet [allow] | ';

  if (!isValidEthereumAddress(manager)) {
    throw Error(errorPrefix + 'Argument `manager` is not a string or is an invalid address.');
  }

  const cometAddress = address[this._cometDeploymentName][constants.Comet];
  const parameters = [ manager, !!isAllowed ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
    ...options
  };

  return eth.trx(cometAddress, 'allow', parameters, trxOptions);
}

/**
 * Enable or disable a Comet account manager using an EIP-712 signature.
 *
 * @param {string} owner The address of the account that is changing a manager.
 * @param {string} manager The address of the manager of the account.
 * @param {boolean} isAllowed Pass true to enable a manager, false to disable.
 * @param {number} nonce The contract state required to match the signature.
 *     This can be retrieved from the contract's public nonces mapping.
 * @param {number} expiry The time at which to expire the signature. A block 
 *     timestamp as seconds since the unix epoch.
 * @param {object} signature An object that contains the v, r, and, s values of
 *     an EIP-712 signature.
 * @param {CallOptions} [options] Options to set for `eth_call`, optional ABI
 *     (as JSON object), and Ethers.js method overrides. The ABI can be a string
 *     of the single intended method, an array of many methods, or a JSON object
 *     of the ABI generated by a Solidity compiler.
 *
 * @returns {object} Returns an Ethers.js transaction object of the allow
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function() {
 *   const allowTx = await comet.allowBySig(
 *     '0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa',
 *     '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
 *     true,
 *     42,
 *     9999999999,
 *     {
 *       v: '0x1b',
 *       r: '0x130dbca2fafa07424c033b4479687cc1deeb65f08809e3ab397988cc4c6f2e78',
 *       s: '0x1debeb8250262f23906b1177161f0c7c9aa3641e8bff5b6f5c88a6bb78d5d8cd'
 *     }
 *   );
 *   console.log('Ethers.js transaction object', allowTx);
 * })().catch(console.error);
 * ```
 */
export async function allowBySig(
  owner: string,
  manager: string,
  isAllowed: boolean,
  nonce: number,
  expiry: number,
  signature: Signature = { v: '', r: '', s: '' },
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await checkValidCometProvider(this);

  const errorPrefix = 'Compound [allowBySig] | ';

  if (typeof owner !== 'string') {
    throw Error(errorPrefix + 'Argument `owner` must be a string.');
  }

  try {
    owner = toChecksumAddress(owner);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `owner` must be a valid Ethereum address.');
  }

  if (typeof manager !== 'string') {
    throw Error(errorPrefix + 'Argument `manager` must be a string.');
  }

  try {
    manager = toChecksumAddress(manager);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `manager` must be a valid Ethereum address.');
  }

  if (typeof nonce !== 'number') {
    throw Error(errorPrefix + 'Argument `nonce` must be an integer.');
  }

  if (typeof expiry !== 'number') {
    throw Error(errorPrefix + 'Argument `expiry` must be an integer.');
  }

  if (
    !Object.isExtensible(signature) ||
    !signature.v ||
    !signature.r ||
    !signature.s
  ) {
    throw Error(errorPrefix + 'Argument `signature` must be an object that ' + 
      'contains the v, r, and s pieces of an EIP-712 signature.');
  }

  const cometAddress = address[this._cometDeploymentName][constants.Comet];
  const trxOptions: CallOptions = {
    ...options,
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };
  const { v, r, s } = signature;
  const parameters = [ owner, manager, isAllowed, nonce, expiry, v, r, s ];
  const method = 'allowBySig';

  return eth.trx(cometAddress, method, parameters, trxOptions);
}

/**
 * Create an EIP-712 signature for enabling or disabling a Comet account 
 *     manager. Anyone can post it to the blockchain using the `allowBySig` 
 *     method, which does have gas costs.
 *
 * @param {string} manager The address of the manager of the account.
 * @param {boolean} isAllowed Pass true to enable a manager, false to disable.
 * @param {number} [expiry] The time at which to expire the signature. A block 
 *     timestamp as seconds since the unix epoch. Defaults to `10e9`.
 *
 * @returns {object} Returns an object that contains the `v`, `r`, and `s` 
 *     components of an Ethereum signature as hexadecimal strings.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 *
 * (async () => {
 *
 *   const allowSignature = await comet.createAllowSignature(
 *     '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
 *     true
 *   );
 *   console.log('allowSignature', allowSignature);
 *
 * })().catch(console.error);
 * ```
 */
export async function createAllowSignature(
  manager: string,
  isAllowed: boolean,
  expiry = 10e9
) : Promise<Signature> {
  await checkValidCometProvider(this);
  const errorPrefix = 'Compound Comet [createAllowSignature] | ';

  const net = this._network;
  const provider = this._provider;
  const cometAddress = address[this._cometDeploymentName][constants.Comet];
  const chainId = net.id;

  let userAddress = provider.address;

  if (!userAddress && provider.getAddress) {
    userAddress = await provider.getAddress();
  }

  const owner = userAddress;

  if (typeof manager !== 'string') {
    throw Error(errorPrefix + 'Argument `manager` must be a string.');
  }

  try {
    manager = toChecksumAddress(manager);
  } catch(e) {
    throw Error(errorPrefix + 'Argument `manager` must be a valid Ethereum address.');
  }

  const nonce = +(await eth.read(
    cometAddress,
    'function userNonce(address) returns (uint)',
    [ userAddress ],
    { provider }
  )).toString();

  const name = (await eth.read(
    cometAddress,
    'function name() view returns (string memory)',
    [],
    { provider }
  )).toString();

  const version = (await eth.read(
    cometAddress,
    'function version() view returns (string memory)',
    [],
    { provider }
  )).toString();

  const domain: EIP712Domain = {
    name,
    version,
    chainId,
    verifyingContract: cometAddress
  };

  const primaryType = 'Authorization';

  const message: AllowSignatureMessage = {
    owner,
    manager,
    isAllowed,
    nonce,
    expiry
  };

  const types: AllowTypes = {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Authorization: [
      { name: 'owner', type: 'address' },
      { name: 'manager', type: 'address' },
      { name: 'isAllowed', type: 'bool' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' }
    ]
  };

  const signer = provider.getSigner ? provider.getSigner() : provider;

  const signature = await sign(domain, primaryType, message, types, signer);

  return signature;
}

/**
 * Transfers an asset to another account within Compound Comet.
 *
 * @param {string | boolean} src The source account address in the transfer. If 
 *     the transfer is on behalf of the sender instead of a manager, `true` can 
 *     be passed instead of an address as a string.
 * @param {string} dst The desination account address in the transfer.
 * @param {string} asset A string of the name of the asset to transfer.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to transfer. Use the `mantissa` boolean 
 *     in the `options` parameter to indicate if this value is scaled up (so 
 *     there are no decimals) or in its natural scale.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the transfer
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 *
 * // Ethers.js overrides are an optional last parameter
 * // const trxOptions = { gasLimit: 250000 };
 * 
 * (async function() {
 * 
 *   console.log('Transferring WETH in Compound Comet...');
 *   const trx = await comet.transfer(
 *     true, // on behalf of the sender
 *     destinationAddress,
 *     Compound.WETH,
 *     '10000000',
 *     trxOptions
 *   );
 *   console.log('Ethers.js transaction object', trx);
 * 
 * })().catch(console.error);
 * ```
 */
export async function transfer(
  src: string | boolean,
  dst: string,
  asset: string,
  amount: string | number | BigNumber,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await checkValidCometProvider(this);
  const errorPrefix = 'Compound Comet [transfer] | ';

  const cometAddress = address[this._cometDeploymentName][constants.Comet];
  let assetAddress;
  try { assetAddress = address[this._cometDeploymentName][asset].contract }
  catch(e) {}

  if (
    !src ||
    (src !== true && 
      (
        typeof src !== 'string' ||
        src.length !== 42 ||
        !src.startsWith('0x')
      )
    )
  ) {
    throw Error(errorPrefix + 'Argument `src` is invalid.');
  }

  if (!isValidEthereumAddress(dst)) {
    throw Error(errorPrefix + 'Argument `dst` is not a string or is an invalid address.');
  }

  if (!assetAddress || !collaterals[this._cometDeploymentName].includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be transferred.');
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
    amount = amount * Math.pow(10, decimals[this._cometDeploymentName][asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  if (src === true) {
    src = await this._provider.getAddress();
  }

  options._compoundProvider = this._provider;

  options.abi = abi.Comet;
  const parameters = [ src, dst, assetAddress, amount ];

  return eth.trx(cometAddress, 'transferAssetFrom', parameters, options);
}

/**
 * Withdraws an asset from Compound Comet from the sender's account to itself.
 *
 * @param {string} asset A string of the name of the asset to withdraw.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to withdraw. Use the `mantissa` boolean 
 *     in the `options` parameter to indicate if this value is scaled up (so 
 *     there are no decimals) or in its natural scale.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the withdraw
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 *
 * // Ethers.js overrides are an optional last parameter
 * // const trxOptions = { gasLimit: 250000 };
 * 
 * (async function() {
 * 
 *   console.log('Withdrawing DAI from my account...');
 *   const trx = await comet.withdraw(
 *     Compound.DAI,
 *     10,
 *     trxOptions
 *   );
 *   console.log('Ethers.js transaction object', trx);
 * 
 * })().catch(console.error);
 * ```
 */
export async function withdraw(
  asset: string,
  amount: string | number | BigNumber,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  const src = await this._provider.getAddress();
  const dst = src;
  return _withdraw('withdraw', src, dst, asset, amount, options, this);
}

/**
 * Withdraws an asset from Compound Comet from the sender's account to another.
 *
 * @param {string} dst The desination account address in the withdrawal.
 * @param {string} asset A string of the name of the asset to withdraw.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to withdraw. Use the `mantissa` boolean 
 *     in the `options` parameter to indicate if this value is scaled up (so 
 *     there are no decimals) or in its natural scale.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the withdraw
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 *
 * // Ethers.js overrides are an optional last parameter
 * // const trxOptions = { gasLimit: 250000 };
 * 
 * (async function() {
 * 
 *   console.log('Withdrawing DAI from my account to dst account...');
 *   const trx = await comet.withdrawTo(
 *     dst, // destination, the address that the withdrawn asset is sent to
 *     Compound.DAI,
 *     10,
 *     trxOptions
 *   );
 *   console.log('Ethers.js transaction object', trx);
 * 
 * })().catch(console.error);
 * ```
 */
export async function withdrawTo(
  dst: string,
  asset: string,
  amount: string | number | BigNumber,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  const src = await this._provider.getAddress();
  return _withdraw('withdrawTo', src, dst, asset, amount, options, this);
}

/**
 * Withdraws an asset from Compound Comet from one account to another. The 
 *     caller must be an allowed manager for the source account.
 *
 * @param {string} src The source account address in the withdrawal. The sender
 *     must be an allowed manager for the source account.
 * @param {string} dst The desination account address in the withdrawal.
 * @param {string} asset A string of the name of the asset to withdraw.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to withdraw. Use the `mantissa` boolean 
 *     in the `options` parameter to indicate if this value is scaled up (so 
 *     there are no decimals) or in its natural scale.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the withdraw
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 *
 * // Ethers.js overrides are an optional last parameter
 * // const trxOptions = { gasLimit: 250000 };
 * 
 * (async function() {
 * 
 *   console.log('Withdrawing DAI from src account to dst account...');
 *   const trx = await comet.withdrawFrom(
 *     src, // source address, sender must be an allowed manager for the address
 *     dst, // destination, the address that the withdrawn asset is sent to
 *     Compound.DAI,
 *     10,
 *     trxOptions
 *   );
 *   console.log('Ethers.js transaction object', trx);
 * 
 * })().catch(console.error);
 * ```
 */
export async function withdrawFrom(
  src: string,
  dst: string,
  asset: string,
  amount: string | number | BigNumber,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  return _withdraw('withdrawFrom', src, dst, asset, amount, options, this);
}

async function _withdraw(
  overloadName: string,
  src: string,
  dst: string,
  asset: string,
  amount: string | number | BigNumber,
  options: CallOptions = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _cometInstance: any
) : Promise<TrxResponse> {
  await checkValidCometProvider(_cometInstance);
  const errorPrefix = `Compound Comet [${overloadName}] | `;

  const cometAddress = address[_cometInstance._cometDeploymentName][constants.Comet];
  let assetAddress;
  try { assetAddress = address[_cometInstance._cometDeploymentName][asset].contract }
  catch(e) {}

  if (!isValidEthereumAddress(src)) {
    throw Error(errorPrefix + 'Argument `src` is not a string or is an invalid address.');
  }

  if (!isValidEthereumAddress(dst)) {
    throw Error(errorPrefix + 'Argument `dst` is not a string or is an invalid address.');
  }

  if (!assetAddress || !collaterals[_cometInstance._cometDeploymentName].includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` cannot be withdrawn.');
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
    amount = amount * Math.pow(10, decimals[_cometInstance._cometDeploymentName][asset]);
  }

  amount = ethers.BigNumber.from(amount.toString());

  options._compoundProvider = _cometInstance._provider;

  options.abi = abi.Comet;
  const parameters = [ src, dst, assetAddress, amount ];

  return eth.trx(cometAddress, 'withdrawFrom', parameters, options);
}

/**
 * Gets the supply rate. This method returns the current supply rate as the 
 *     decimal representation of a percentage scaled up by 10 ^ 18.
 * 
 * @param {string | number | BigNumber} [utilization] A number representing the 
 *     utilization rate in which to get the corresponding supply rate. The 
 *     current utilization rate can be fetched by using `Compound.comet.getUtilization()`.
 * 
 * @returns {string} Returns a string of the numeric value of the supply rate.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const supplyRate = await comet.getSupplyRate();
 *   console.log('Supply Rate', supplyRate);
 * })().catch(console.error);
 * ```
 */
export async function getSupplyRate(
  utilization: string | number | BigNumber
) : Promise<string> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const parameters = [ utilization.toString() ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider.provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'getSupplyRate', parameters, trxOptions);
  return result.toString();
}

/**
 * Gets the borrow rate. This method returns the current borrow rate as the 
 *     decimal representation of a percentage scaled up by 10 ^ 18.
 * 
 * @param {string | number | BigNumber} [utilization] A number representing the 
 *     utilization rate in which to get the corresponding supply rate. The 
 *     current utilization rate can be fetched by using `Compound.comet.getUtilization()`.
 * 
 * @returns {string} Returns a string of the numeric value of the borrow rate.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const borrowRate = await comet.getBorrowRate();
 *   console.log('Borrow Rate', borrowRate);
 * })().catch(console.error);
 * ```
 */
export async function getBorrowRate(
  utilization: string | number | BigNumber,
) : Promise<string> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const parameters = [ utilization.toString() ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider.provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'getBorrowRate', parameters, trxOptions);
  return result.toString();
}

/**
 * Gets the utilization rate.
 * 
 * @returns {string} Returns the current protocol utilization as a percentage as
 *     a decimal, represented by an unsigned integer, scaled up by 10 ^ 18.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const utilization = await comet.getUtilization();
 *   console.log('Utilization', utilization);
 * })().catch(console.error);
 * ```
 */
export async function getUtilization() : Promise<string> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const parameters = [];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider.provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'getUtilization', parameters, trxOptions);
  return result.toString();
}

/**
 * This method triggers the liquidation of one or many underwater accounts.
 *
 * @param {string} absorber The account that is issued liquidator points during 
 *     successful execution.
 * @param {string | string[]} accounts A string of one or an array of many 
 *     addresses of underwater accounts.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the absorb
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const addresses = [
 *     '0xUnderwaterAccountAddress1',
 *   ];
 *   const trx = await comet.absorb(addresses);
 *   console.log('Ethers.js transaction object', trx);
 * })().catch(console.error);
 * ```
 */
export async function absorb(
  absorber: string,
  accounts: string[],
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await checkValidCometProvider(this);
  const errorPrefix = 'Compound Comet [absorb] | ';

  if (!isValidEthereumAddress(absorber)) {
    throw Error(errorPrefix + 'Argument `absorber` is not a string or is an invalid address.');
  }

  let invalid;
  if (!Array.isArray(accounts)) {
    invalid = true;
  } else {
    for (let i = 0; i < accounts.length; i++) {
      if (!isValidEthereumAddress(accounts[i])) {
        invalid = true;
        break;
      }
    }
  }

  if (invalid) {
    throw Error(errorPrefix + 'Argument `accounts` array contains an invalid address or is otherwise invalid.');
  }

  const cometAddress = address[this._cometDeploymentName][constants.Comet];
  const parameters = [ absorber, accounts ];

  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
    ...options
  };

  return eth.trx(cometAddress, 'absorb', parameters, trxOptions);
}

/**
 * Gets the Comet protocol reserves for the base asset as an integer.
 * 
 * @returns {string} Returns the current protocol reserves in in the base asset 
 *     as an unsigned integer, scaled up by 10 to the "decimals" integer in the 
 *     base asset's contract.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const reserves = await comet.getReserves();
 *   console.log('Reserves', reserves);
 * })().catch(console.error);
 * ```
 */
export async function getReserves() : Promise<string> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const parameters = [];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'getReserves', parameters, trxOptions);
  return result.toString();
}

/**
 * Gets the Comet protocol target reserves.
 * 
 * @returns {string} Returns the protocol target reserves in the base asset as 
 *     an unsigned integer, scaled up by 10 to the "decimals" integer in the 
 *     base asset's contract.
 * 
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const target = await comet.targetReserves();
 *   console.log('Target Reserves', target);
 * })().catch(console.error);
 * ```
 */
export async function targetReserves() : Promise<string> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const parameters = [];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'targetReserves', parameters, trxOptions);
  return result.toString();
}

/**
 * Gets the collateralization of an account as a boolean.
 * 
 * @param {string} account The account address as a string.
 * 
 * @returns {boolean} Returns the collateralization of the account as a boolean.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const address = '0xAccountThatBorrows';
 *   const isCollateralized = await comet.isBorrowCollateralized(address);
 *   console.log('Is Collateralized', isCollateralized);
 * })().catch(console.error);
 * ```
 */
export async function isBorrowCollateralized(account: string) : Promise<boolean> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const errorPrefix = 'Compound Comet [isBorrowCollateralized] | ';

  if (!isValidEthereumAddress(account)) {
    throw Error(errorPrefix + 'Argument `account` is not a string or is an invalid address.');
  }

  const parameters = [ account ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'isBorrowCollateralized', parameters, trxOptions);
  return result;
}

/**
 * Checks if the passed account is presently liquidatable.
 * 
 * @param {string} account The account address as a string.
 * 
 * @returns {boolean} Returns the ability to liquidate the account as a boolean.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const address = '0xAccountThatBorrows';
 *   const isLiquidatable = await comet.isLiquidatable(address);
 *   console.log('Is Liquidatable', isLiquidatable);
 * })().catch(console.error);
 * ```
 */
export async function isLiquidatable(account: string) : Promise<boolean> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const errorPrefix = 'Compound Comet [isLiquidatable] | ';

  if (!isValidEthereumAddress(account)) {
    throw Error(errorPrefix + 'Argument `account` is not a string or is an invalid address.');
  }

  const parameters = [ account ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'isLiquidatable', parameters, trxOptions);
  return result;
}

/**
 * Gets the price of the asset that is passed to it in USD as an unsigned 
 *     integer, scaled up by 10 ^ 8.
 * 
 * @param {string} asset A string of the name of the asset.
 * @param {number | string | BigNumber} baseAmount A string, number, or BigNumber
 *     object of the amount of the base asset to get a quote. Use the `mantissa`
 *     boolean in the `options` parameter to indicate if this value is scaled up
 *     (so there are no decimals) or in its natural scale.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 * 
 * @returns {string} Returns the price of the asset that is passed to it in USD 
 *     as an unsigned integer, scaled up by 10 ^ 6.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const price = await comet.quoteCollateral(Compound.UNI, '1000000000');
 *   console.log('Price quote of 1000 base asset of UNI', price);
 * })().catch(console.error);
 * ```
 */
export async function quoteCollateral(
  asset: string,
  baseAmount: string | number | BigNumber,
  options: CallOptions = {}
) : Promise<string> {
  await checkValidCometProvider(this);
  const deployment = this._cometDeploymentName;
  const cometAddress = address[deployment][constants.Comet];
  let assetAddress;
  try { assetAddress = address[deployment][asset].contract }
  catch(e) {}

  const errorPrefix = 'Compound Comet [quoteCollateral] | ';

  if (!assetAddress || !collaterals[deployment].includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` is not priceable.');
  }

  if (
    typeof baseAmount !== 'number' &&
    typeof baseAmount !== 'string' &&
    !ethers.BigNumber.isBigNumber(baseAmount)
  ) {
    throw Error(errorPrefix + 'Argument `baseAmount` must be a string, number, or BigNumber.');
  }

  if (!options.mantissa) {
    baseAmount = +baseAmount;
    baseAmount = baseAmount * Math.pow(10, decimals[deployment][getBaseAssetName(deployment)]);
  }

  baseAmount = ethers.BigNumber.from(baseAmount.toString());

  const parameters = [ assetAddress, baseAmount ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'quoteCollateral', parameters, trxOptions);
  return result.toString();
}

/**
 * Buys discounted collateral from the protocol. This collateral is available 
 *     after an insolvent borrower account has been absorbed by the protocol. 
 *     Collateral is only sold when the target reserves amount is not yet
 *     reached. The `mantissa` call option is applied to both the `minAmount` 
 *     and `baseAmount` parameters.
 * 
 * @param {string} asset A string of the name of the asset to buy.
 * @param {number | string | BigNumber} minAmount A string, number, or BigNumber
 *     object of the minimum amount of an asset to buy from the protocol. Use 
 *     the `mantissa` boolean in the `options` parameter to indicate if this 
 *     value is scaled up (so there are no decimals) or in its natural scale.
 * @param {number | string | BigNumber} baseAmount A string, number, or 
 *     BigNumber object of the amount of base asset used to buy the collateral.
 * @param {string} recipient The desination account address of the collateral 
 *     that is purchased.
 * @param {boolean} noApprove Explicitly prevent this method from attempting an 
 *     ERC-20 `approve` transaction prior to buying collateral using the base
 *     asset.
 * @param {CallOptions} [options] Call options and Ethers.js overrides for the 
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the buy
 *     transaction.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 *
 * (async function() {
 * 
 *   const me = '0xRecipient';
 * 
 *   console.log('Buying collateral...');
 *   const trx = await comet.buyCollateral(
 *     Compound.WBTC,
 *     1,
 *     10000
 *   );
 *   console.log('Ethers.js transaction object', trx);
 *   await trx.wait(1);
 * 
 * })().catch(console.error);
 * ```
 */
export async function buyCollateral(
  asset: string,
  minAmount: string | number | BigNumber,
  baseAmount: string | number | BigNumber,
  recipient: string,
  noApprove = false,
  options: CallOptions = {}
) : Promise<TrxResponse> {
  await checkValidCometProvider(this);
  const errorPrefix = 'Compound Comet [buyCollateral] | ';

  const provider = this._provider;
  const deployment = this._cometDeploymentName;
  const cometAddress = address[deployment][constants.Comet];
  const baseAssetAddress = address[deployment][getBaseAssetName(deployment)].contract;

  let assetAddress;
  try { assetAddress = address[deployment][asset].contract }
  catch(e) {}

  if (
    !isValidEthereumAddress(assetAddress) ||
    assetAddress === baseAssetAddress
  ) {
    throw Error(errorPrefix + 'Argument `asset` is not valid to buy.');
  }

  if (!isValidEthereumAddress(recipient)) {
    throw Error(errorPrefix + 'Argument `recipient` is not valid.');
  }

  if (!options.mantissa) {
    baseAmount = +baseAmount;
    baseAmount = baseAmount * Math.pow(10, decimals[deployment][getBaseAssetName(deployment)]);
    minAmount = +minAmount;
    minAmount = minAmount * Math.pow(10, decimals[deployment][asset]);
  }

  baseAmount = ethers.BigNumber.from(baseAmount.toString());
  minAmount = ethers.BigNumber.from(minAmount.toString());

  options.abi = abi.Erc20;
  options._compoundProvider = provider;

  if (noApprove !== true) {
    let userAddress = provider.address;

    if (!userAddress && provider.getAddress) {
      userAddress = await provider.getAddress();
    }

    // Check allowance
    const allowance = await eth.read(
      baseAssetAddress,
      'allowance',
      [ userAddress, cometAddress ],
      options
    );

    const notEnough = allowance.lt(baseAmount);

    if (notEnough) {
      // ERC-20 approve transaction
      await eth.trx(
        baseAssetAddress,
        'approve',
        [ cometAddress, baseAmount ],
        options
      );
    }
  }

  options.abi = abi.Comet;
  const parameters = [ assetAddress, minAmount, baseAmount, recipient ];

  return eth.trx(cometAddress, 'buyCollateral', parameters, options);
}

/**
 * Gets the price of the asset that is passed to it in USD as an unsigned 
 *     integer, scaled up by 10 ^ 8.
 * 
 * @param {string} asset A string of the symbol of the asset.
 * 
 * @returns {string} Returns the price of the asset that is passed to it in USD 
 *     as an unsigned integer, scaled up by 10 ^ 8.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const price = await comet.getPrice(Compound.WBTC);
 *   console.log('Price of WBTC', price);
 * })().catch(console.error);
 * ```
 */
export async function getPrice(asset: string) : Promise<string> {
  await checkValidCometProvider(this);
  const deployment = this._cometDeploymentName;
  const cometAddress = address[deployment][constants.Comet];

  const errorPrefix = 'Compound Comet [getPrice] | ';

  let assetPriceFeedAddress;
  try {
    assetPriceFeedAddress = address[deployment][asset].priceFeed;
  } catch(e) {
    throw Error(errorPrefix + 'Argument `asset` price is not available.');
  }

  const parameters = [ assetPriceFeedAddress ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'getPrice', parameters, trxOptions);
  return result.toString();
}

/**
 * Gets the current borrow balance of an account as an unsigned integer. If the
 *     account has a non-negative base asset balance, it will return 0.
 * 
 * @param {string} account The account address as a string.
 * 
 * @returns {string} Returns the collateralization of the account as an integer.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const address = '0xAccountThatBorrows';
 *   const bal = await comet.borrowBalanceOf(address);
 *   console.log('Borrow Balance', bal.toString());
 * })().catch(console.error);
 * ```
 */
export async function borrowBalanceOf(account: string) : Promise<string> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const errorPrefix = 'Compound Comet [borrowBalanceOf] | ';

  if (!isValidEthereumAddress(account)) {
    throw Error(errorPrefix + 'Argument `account` is not a string or is an invalid address.');
  }

  const parameters = [ account ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'borrowBalanceOf', parameters, trxOptions);
  return result.toString();
}

/**
 * Gets the current balance of the collateral asset for the specified account.
 * 
 * @param {string} account The account address as a string.
 * @param {string} asset The name of the collateral asset.
 * 
 * @returns {string} Returns the collateral balance as an integer.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const address = '0xAccountThatSupplied';
 *   const balance = await comet.collateralBalanceOf(address, Compound.WBTC);
 *   console.log('Collateral balance', balance);
 * })().catch(console.error);
 * ```
 */
export async function collateralBalanceOf(
  account: string,
  asset: string
) : Promise<string> {
  await checkValidCometProvider(this);
  const deployment = this._cometDeploymentName;
  const cometAddress = address[deployment][constants.Comet];

  const errorPrefix = 'Compound Comet [collateralBalanceOf] | ';

  if (!isValidEthereumAddress(account)) {
    throw Error(errorPrefix + 'Argument `account` is not a string or is an invalid address.');
  }

  let assetAddress;
  try { assetAddress = address[deployment][asset].contract }
  catch(e) {}

  if (!assetAddress || !collaterals[deployment].includes(asset)) {
    throw Error(errorPrefix + 'Argument `asset` is not a valid collateral.');
  }

  const parameters = [ account, assetAddress ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider.provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'collateralBalanceOf', parameters, trxOptions);
  return result.toString();
}

/**
 * Gets the stored information for a supported asset.
 * 
 * @param {number | string | BigNumber} assetIndex The index of the asset in the
 *     array in the Comet contract.
 * 
 * @returns {AssetInfo} Returns a tuple of the asset's information.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const assetInfo = await comet.getAssetInfo(2);
 *   console.log('Asset Info', assetInfo);
 * })().catch(console.error);
 * ```
 */
export async function getAssetInfo(
  assetIndex: string | number | BigNumber,
) : Promise<AssetInfo> {
  await checkValidCometProvider(this);
  const cometAddress = address[this._cometDeploymentName][constants.Comet];

  const parameters = [ assetIndex ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'getAssetInfo', parameters, trxOptions);
  const info: AssetInfo = {
    offset: result.offset,
    asset: result.asset,
    priceFeed: result.priceFeed,
    scale: result.scale,
    borrowCollateralFactor: result.borrowCollateralFactor,
    liquidateCollateralFactor: result.liquidateCollateralFactor,
    liquidationFactor: result.liquidationFactor,
    supplyCap: result.supplyCap,
  };
  return info;
}

/**
 * Gets the stored information for a supported asset.
 * 
 * @param {string} _address The contract address of the supported asset.
 * 
 * @returns {AssetInfo} Returns a tuple of the asset's information.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const assetInfo = await comet.getAssetInfoByAddress('0xContract');
 *   console.log('Asset Info', assetInfo);
 * })().catch(console.error);
 * ```
 */
export async function getAssetInfoByAddress(_address: string) : Promise<AssetInfo> {
  await checkValidCometProvider(this);
  const deployment = this._cometDeploymentName;
  const cometAddress = address[deployment][constants.Comet];
  const baseAssetAddress = address[deployment][getBaseAssetName(deployment)].contract;

  const errorPrefix = 'Compound Comet [getAssetInfoByAddress] | ';

  if (
    !isValidEthereumAddress(_address) ||
    _address === baseAssetAddress
  ) {
    throw Error(errorPrefix + 'Argument `_address` is not valid.');
  }

  const parameters = [ _address ];
  const trxOptions: CallOptions = {
    _compoundProvider: this._provider,
    abi: abi.Comet,
  };

  const result = await eth.read(cometAddress, 'getAssetInfoByAddress', parameters, trxOptions);
  const info: AssetInfo = {
    offset: result.offset,
    asset: result.asset,
    priceFeed: result.priceFeed,
    scale: result.scale,
    borrowCollateralFactor: result.borrowCollateralFactor,
    liquidateCollateralFactor: result.liquidateCollateralFactor,
    liquidationFactor: result.liquidationFactor,
    supplyCap: result.supplyCap,
  };
  return info;
}

/**
 * Gets the stored information for a supported asset.
 * 
 * @param {string} symbol The symbol of the supported asset.
 * 
 * @returns {AssetInfo} Returns a tuple of the asset's information.
 *
 * @example
 *
 * ```
 * const compound = new Compound(window.ethereum);
 * const comet = compound.comet.MAINNET_USDC();
 * 
 * (async function () {
 *   const assetInfo = await comet.getAssetInfoBySymbol(Compound.WETH);
 *   console.log('Asset Info', assetInfo);
 * })().catch(console.error);
 * ```
 */
export async function getAssetInfoBySymbol(asset: string) : Promise<AssetInfo> {
  await checkValidCometProvider(this);

  const errorPrefix = 'Compound Comet [getAssetInfoBySymbol] | ';

  let assetAddress;
  try { assetAddress = address[this._cometDeploymentName][asset].contract }
  catch(e) {}

  if (
    !assetAddress ||
    asset === getBaseAssetName(this._cometDeploymentName) ||
    !collaterals[this._cometDeploymentName].includes(asset)
  ) {
    throw Error(errorPrefix + 'Argument `asset` is not a valid collateral.');
  }

  const result = await this.getAssetInfoByAddress(assetAddress);
  const info: AssetInfo = {
    offset: result.offset,
    asset: result.asset,
    priceFeed: result.priceFeed,
    scale: result.scale,
    borrowCollateralFactor: result.borrowCollateralFactor,
    liquidateCollateralFactor: result.liquidateCollateralFactor,
    liquidationFactor: result.liquidationFactor,
    supplyCap: result.supplyCap,
  };
  return info;
}

/**
 * Gets an array of the supported Compound III deployment names.
 *
 * @returns {string[]} Returns an array of strings that are used to refer to each Compound III deployment.
 *
 * @example
 *
 * ```
 * const networkNames = Compound.comet.getSupportedDeployments();
 * ```
 */
export function getSupportedDeployments() : string[] {
  return Object.keys(address);
}

/**
 * Gets an array of the supported collateral assets in the specified Comet 
 *     instance.
 *
 * @param {string?} deployment The specific deployment in which to get supported 
 *     collaterals. The key is usually `${network}_${baseAssetSymbol}`. Use 
 *     `getSupportedDeployments` to get proper values for this parameter. 
 *     Defaults to cUSDCv3 on Ethereum Mainnet (`mainnet_usdc`) if nothing is 
 *     passed.
 * 
 * @returns {string[]} Returns an array of strings of the asset names.
 *
 * @example
 *
 * ```
 * const collaterals = Compound.comet.getSupportedCollaterals();
 * ```
 */
export function getSupportedCollaterals(
  deployment?: string
) : string[] {
  if (!deployment) {
    deployment = 'mainnet_usdc';
  }

  if (!collaterals[deployment]) {
    throw Error('Argument `deployment` is not recognized.');
  } else {
    return collaterals[deployment];
  }
}

/**
 * Gets the name of the base asset in the specified instance.
 *
 * @param {string?} deployment The specific deployment in which to get supported 
 *     collaterals. The key is usually `${network}_${baseAssetSymbol}`. Use 
 *     `getSupportedDeployments` to get proper values for this parameter. 
 *     Defaults to cUSDCv3 on Ethereum Mainnet (`mainnet_usdc`) if nothing is 
 *     passed.
 * 
 * @returns {string} Returns a string of the base asset name.
 *
 * @example
 *
 * ```
 * const baseAssetName = Compound.comet.getBaseAssetName();
 * ```
 */
export function getBaseAssetName(
  deployment?: string
) : string {
  if (!deployment) {
    deployment = 'mainnet_usdc';
  }

  if (!base[deployment]) {
    throw Error('Argument `deployment` is not recognized.');
  } else {
    return base[deployment];
  }
}
