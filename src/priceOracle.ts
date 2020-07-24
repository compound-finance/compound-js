import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { constants, address, abi, cTokens, underlyings, decimals } from './constants';

function validateAsset(asset: string, argument: string, errorPrefix: string) {
  if (typeof asset !== 'string' || asset.length < 1) {
    throw Error(errorPrefix + 'Argument `' + argument + '` must be a non-empty string.');
  }

  const assetIsCToken = asset[0] === 'c';

  const cTokenName = assetIsCToken ? asset : 'c' + asset;
  const cTokenAddress = address[this._network.name][cTokenName];

  const underlyingName = assetIsCToken ? asset.slice(1, asset.length) : asset;
  const underlyingAddress = address[this._network.name][underlyingName];

  if (!cTokens.includes(cTokenName) || !underlyings.includes(underlyingName)) {
    throw Error(errorPrefix + 'Argument `' + argument + '` is not supported.');
  }

  const underlyingDecimals = decimals[underlyingName];

  return [assetIsCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, underlyingDecimals];
}

async function cTokenExchangeRate(cTokenAddress, cTokenName, underlyingDecimals) {
  const address = cTokenAddress;
  const method = 'exchangeRateCurrent';
  const options = {
    _compoundProvider: this._provider,
    abi: cTokenName === constants.cETH ? abi.cEther : abi.cErc20,
  };
  const exchangeRateCurrent = await eth.read(address, method, [], options);
  const mantissa = 18 + parseInt(underlyingDecimals) - 8; // cToken always 8 decimals
  const oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);

  return oneCTokenInUnderlying;
}

export async function getPrice(asset: string, inAsset: string=constants.ETH) {
  await netId(this);
  const errorPrefix = 'Compound [getPrice] | ';

  const [
    assetIsCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, underlyingDecimals
  ] = validateAsset.bind(this)(asset, 'asset', errorPrefix);

  const [
    inAssetIsCToken, inAssetCTokenName, inAssetCTokenAddress, inAssetUnderlyingName, inAssetUnderlyingAddress, inAssetUnderlyingDecimals
  ] = validateAsset.bind(this)(inAsset, 'inAsset', errorPrefix);

  const priceOracleAddress = address[this._network.name].PriceOracle;
  const trxOptions: any = {
    _compoundProvider: this._provider,
    abi: abi.PriceOracle,
  };

  const priceMantissa = await eth.read(priceOracleAddress, 'getUnderlyingPrice', [ cTokenAddress ], trxOptions);

  let inAssetPriceMantissa = 1e18;
  if (inAssetUnderlyingName !== constants.ETH) {
    inAssetPriceMantissa = await eth.read(priceOracleAddress, 'getUnderlyingPrice', [ inAssetCTokenAddress ], trxOptions);
  }

  const assetUnderlyingPrice = priceMantissa / (1e18 / (Math.pow(10, underlyingDecimals - 18)));
  const inAssetUnderlyingPrice = inAssetPriceMantissa / (1e18 / (Math.pow(10, inAssetUnderlyingDecimals - 18)));

  let assetCTokensInUnderlying, inAssetCTokensInUnderlying;

  if (assetIsCToken) {
    assetCTokensInUnderlying = await cTokenExchangeRate.bind(this)(cTokenAddress, cTokenName, underlyingDecimals);
  }

  if (inAssetIsCToken) {
    inAssetCTokensInUnderlying = await cTokenExchangeRate.bind(this)(inAssetCTokenAddress, inAssetCTokenName, inAssetUnderlyingDecimals);
  }

  let result;
  if (!assetIsCToken && !inAssetIsCToken) {
    result = assetUnderlyingPrice / inAssetUnderlyingPrice;
  } else if (assetIsCToken && !inAssetIsCToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther * assetCTokensInUnderlying;
  } else if (!assetIsCToken && inAssetIsCToken) {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    result = assetInOther / inAssetCTokensInUnderlying;
  } else {
    const assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
    const cTokensInUnderlying = assetInOther / assetCTokensInUnderlying;
    result = inAssetCTokensInUnderlying * cTokensInUnderlying;
  }

  return result;
}
