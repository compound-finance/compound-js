"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.exitMarket = exports.enterMarkets = void 0;
var eth = require("./eth");
var helpers_1 = require("./helpers");
var constants_1 = require("./constants");
/**
 * Enters the user's address into Compound protocol markets.
 *
 * @param {any[]} markets An array of strings of markets to enter, meaning use
 *     those supplied assets as collateral.
 *
 * @returns {object} Returns an Ethers.js transaction object of the enterMarkets
 *     transaction.
 */
function enterMarkets(markets) {
    if (markets === void 0) { markets = []; }
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, addresses, i, comptrollerAddress, parameters, trxOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _a.sent();
                    errorPrefix = 'Compound [enterMarkets] | ';
                    if (typeof markets === 'string') {
                        markets = [markets];
                    }
                    if (!Array.isArray(markets)) {
                        throw Error(errorPrefix + 'Argument `markets` must be an array or string.');
                    }
                    addresses = [];
                    for (i = 0; i < markets.length; i++) {
                        if (markets[i][0] !== 'c') {
                            markets[i] = 'c' + markets[i];
                        }
                        if (!constants_1.cTokens.includes(markets[i])) {
                            throw Error(errorPrefix + 'Provided market `' + markets[i] + '` is not a recognized cToken.');
                        }
                        addresses.push(constants_1.address[this._network.name][markets[i]]);
                    }
                    comptrollerAddress = constants_1.address[this._network.name].Comptroller;
                    parameters = [addresses];
                    trxOptions = {
                        _compoundProvider: this._provider,
                        abi: constants_1.abi.Comptroller
                    };
                    return [2 /*return*/, eth.trx(comptrollerAddress, 'enterMarkets', parameters, trxOptions)];
            }
        });
    });
}
exports.enterMarkets = enterMarkets;
/**
 * Exits the user's address from a Compound protocol market.
 *
 * @param {string} market An string of the market to exit.
 *
 * @returns {object} Returns an Ethers.js transaction object of the exitMarket
 *     transaction.
 */
function exitMarket(market) {
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, cTokenAddress, comptrollerAddress, parameters, trxOptions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _a.sent();
                    errorPrefix = 'Compound [exitMarkets] | ';
                    if (typeof market !== 'string' || market === '') {
                        throw Error(errorPrefix + 'Argument `market` must be a string of a cToken market name.');
                    }
                    if (market[0] !== 'c') {
                        market = 'c' + market;
                    }
                    if (!constants_1.cTokens.includes(market)) {
                        throw Error(errorPrefix + 'Provided market `' + market + '` is not a recognized cToken.');
                    }
                    cTokenAddress = constants_1.address[this._network.name][market];
                    comptrollerAddress = constants_1.address[this._network.name].Comptroller;
                    parameters = [cTokenAddress];
                    trxOptions = {
                        _compoundProvider: this._provider,
                        abi: constants_1.abi.Comptroller
                    };
                    return [2 /*return*/, eth.trx(comptrollerAddress, 'exitMarket', parameters, trxOptions)];
            }
        });
    });
}
exports.exitMarket = exitMarket;
//# sourceMappingURL=comptroller.js.map