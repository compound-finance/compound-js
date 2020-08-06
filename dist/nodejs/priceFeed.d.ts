/**
 * Gets an asset's price from the Compound protocol open price feed. The price
 *    of the asset can be returned in any other supported asset value, including
 *    all cTokens and underlyings.
 *
 * @param {string} asset A string of a supported asset in which to find the
 *    current price.
 * @param {string} [inAsset] A string of a supported asset in which to express
 *    the `asset` parameter's price. This defaults to USDC.
 *
 * @returns {string} Returns a string of the numerical value of the asset.
 */
export declare function getPrice(asset: string, inAsset?: string): Promise<any>;
