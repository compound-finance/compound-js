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
exports.redeem = exports.supply = void 0;
var ethers_1 = require("ethers");
var eth = require("./eth");
var helpers_1 = require("./helpers");
var constants_1 = require("./constants");
function supply(asset, amount, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, cTokenName, cTokenAddress, trxOptions, parameters;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _a.sent();
                    errorPrefix = 'Compound [supply] | ';
                    cTokenName = 'c' + asset;
                    cTokenAddress = constants_1.address[this._network.name][cTokenName];
                    if (!cTokenAddress || !constants_1.underlyings.includes(asset)) {
                        throw Error(errorPrefix + 'Argument `asset` is not a recognized cToken address.');
                    }
                    if (typeof amount !== 'number' &&
                        typeof amount !== 'string' &&
                        !ethers_1.ethers.BigNumber.isBigNumber(amount)) {
                        throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
                    }
                    if (!options.mantissa) {
                        amount = +amount;
                        amount = amount * Math.pow(10, constants_1.decimals[asset]);
                    }
                    amount = ethers_1.ethers.BigNumber.from(amount.toString());
                    trxOptions = { _compoundProvider: this._provider };
                    parameters = [];
                    if (cTokenName === constants_1.constants.cETH) {
                        trxOptions.value = amount;
                        trxOptions.abi = constants_1.abi.cEther;
                    }
                    else {
                        parameters.push(amount);
                        trxOptions.abi = constants_1.abi.cErc20;
                    }
                    return [2 /*return*/, eth.trx(cTokenAddress, 'mint', parameters, trxOptions)];
            }
        });
    });
}
exports.supply = supply;
function redeem(asset, amount, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, passedCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, trxOptions, parameters, method;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _a.sent();
                    errorPrefix = 'Compound [redeem] | ';
                    if (typeof asset !== 'string' || asset.length < 1) {
                        throw Error(errorPrefix + 'Argument `asset` must be a non-empty string.');
                    }
                    passedCToken = asset[0] === 'c';
                    cTokenName = passedCToken ? asset : 'c' + asset;
                    cTokenAddress = constants_1.address[this._network.name][cTokenName];
                    underlyingName = passedCToken ? asset.slice(1, asset.length) : asset;
                    underlyingAddress = constants_1.address[this._network.name][underlyingName];
                    if (!constants_1.cTokens.includes(cTokenName) || !constants_1.underlyings.includes(underlyingName)) {
                        throw Error(errorPrefix + 'Argument `asset` is not supported.');
                    }
                    if (typeof amount !== 'number' &&
                        typeof amount !== 'string' &&
                        !ethers_1.ethers.BigNumber.isBigNumber(amount)) {
                        throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
                    }
                    if (!options.mantissa) {
                        amount = +amount;
                        amount = amount * Math.pow(10, constants_1.decimals[asset]);
                    }
                    amount = ethers_1.ethers.BigNumber.from(amount.toString());
                    trxOptions = {
                        _compoundProvider: this._provider,
                        abi: cTokenName === constants_1.constants.cETH ? constants_1.abi.cEther : constants_1.abi.cErc20
                    };
                    parameters = [amount];
                    method = passedCToken ? 'redeem' : 'redeemUnderlying';
                    return [2 /*return*/, eth.trx(cTokenAddress, method, parameters, trxOptions)];
            }
        });
    });
}
exports.redeem = redeem;
//# sourceMappingURL=cToken.js.map