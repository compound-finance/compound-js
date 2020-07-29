"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var ethers_1 = require("ethers");
var eth = require("./eth");
var util = require("./util");
var comptroller = require("./comptroller");
var cToken = require("./cToken");
var priceOracle = require("./priceOracle");
var constants_1 = require("./constants");
// Turn off Ethers.js warnings
ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.ERROR);
/**
 * Creates an instance of the Compound.js SDK.
 *
 * @param {any{} | string} [provider] Optional Ethereum network provider.
 *     Defaults to Ethers.js fallback mainnet provider.
 * @param {any{}} [options] Optional provider options.
 *
 * @returns {object} Returns an instance of Compound.js SDK.
 */
var Compound = function (provider, options) {
    if (provider === void 0) { provider = 'mainnet'; }
    if (options === void 0) { options = {}; }
    options.provider = provider || options.provider;
    provider = eth.createProvider(options);
    var instance = __assign(__assign(__assign({ _provider: provider }, comptroller), cToken), priceOracle);
    // Instance needs to know which network the provider connects to, so it can
    //     use the correct contract addresses.
    instance._networkPromise = eth.getProviderNetwork(provider).then(function (network) {
        delete instance._networkPromise;
        instance._network = network;
    });
    return instance;
};
Compound.eth = eth;
Compound.util = util;
Compound._ethers = ethers_1.ethers;
Object.assign(Compound, constants_1.constants);
module.exports = Compound;
//# sourceMappingURL=index.js.map