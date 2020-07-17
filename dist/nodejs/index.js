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
var cToken = require("./cToken");
var constants_1 = require("./constants");
var Compound = function (provider, options) {
    if (provider === void 0) { provider = 'mainnet'; }
    if (options === void 0) { options = {}; }
    options.provider = provider || options.provider;
    provider = eth.createProvider(options);
    var instance = __assign({ _ethers: ethers_1.ethers, _provider: provider }, cToken);
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
Object.assign(Compound, constants_1.constants);
module.exports = Compound;
//# sourceMappingURL=index.js.map