/**
 * Enters the user's address into Compound protocol markets.
 *
 * @param {any[]} markets An array of strings of markets to enter, meaning use
 *     those supplied assets as collateral.
 *
 * @returns {object} Returns an Ethers.js transaction object of the enterMarkets
 *     transaction.
 */
export declare function enterMarkets(markets?: any): Promise<any>;
/**
 * Exits the user's address from a Compound protocol market.
 *
 * @param {string} market An string of the market to exit.
 *
 * @returns {object} Returns an Ethers.js transaction object of the exitMarket
 *     transaction.
 */
export declare function exitMarket(market: string): Promise<any>;
