"use strict";
exports.__esModule = true;
exports.getAddress = void 0;
var constants_1 = require("./constants");
/**
 * Gets the contract address of the named contract. This method supports
 *     contracts used by the Compound protocol.
 *
 * @param {string} contract The name of the contract.
 * @param {string} [network] Optional name of the Ethereum network. Main net and
 * all the popular public test nets are supported.
 *
 * @returns {string} Returns the address of the contract.
 */
function getAddress(contract, network) {
    if (network === void 0) { network = 'mainnet'; }
    return constants_1.address[network][contract];
}
exports.getAddress = getAddress;
//# sourceMappingURL=util.js.map