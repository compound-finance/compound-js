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
exports.repayBorrow = exports.borrow = exports.redeem = exports.supply = void 0;
var ethers_1 = require("ethers");
var eth = require("./eth");
var helpers_1 = require("./helpers");
var constants_1 = require("./constants");
/**
 * Supplies the user's Ethereum asset to the Compound protocol.
 *
 * @param {string} asset A string of the asset to supply.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to supply. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale.
 * @param {object} options Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the supply
 *     transaction.
 */
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
                        throw Error(errorPrefix + 'Argument `asset` cannot be supplied.');
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
/**
 * Redeems the user's Ethereum asset from the Compound protocol.
 *
 * @param {string} asset A string of the asset to redeem, or its cToken name.
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to redeem. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale. This can be an amount of
 *     cTokens or underlying asset (use the `asset` parameter to specify).
 * @param {object} options Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the redeem
 *     transaction.
 */
function redeem(asset, amount, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, assetIsCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, trxOptions, parameters, method;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _a.sent();
                    errorPrefix = 'Compound [redeem] | ';
                    if (typeof asset !== 'string' || asset.length < 1) {
                        throw Error(errorPrefix + 'Argument `asset` must be a non-empty string.');
                    }
                    assetIsCToken = asset[0] === 'c';
                    cTokenName = assetIsCToken ? asset : 'c' + asset;
                    cTokenAddress = constants_1.address[this._network.name][cTokenName];
                    underlyingName = assetIsCToken ? asset.slice(1, asset.length) : asset;
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
                    method = assetIsCToken ? 'redeem' : 'redeemUnderlying';
                    return [2 /*return*/, eth.trx(cTokenAddress, method, parameters, trxOptions)];
            }
        });
    });
}
exports.redeem = redeem;
/**
 * Borrows an Ethereum asset from the Compound protocol for the user. The user's
 *     address must first have supplied collateral and entered a corresponding
 *     market.
 *
 * @param {string} asset A string of the asset to borrow (must be a supported
 *     underlying asset).
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale.
 * @param {object} options Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the borrow
 *     transaction.
 */
function borrow(asset, amount, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, cTokenName, cTokenAddress, trxOptions, parameters;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _a.sent();
                    errorPrefix = 'Compound [borrow] | ';
                    cTokenName = 'c' + asset;
                    cTokenAddress = constants_1.address[this._network.name][cTokenName];
                    if (!cTokenAddress || !constants_1.underlyings.includes(asset)) {
                        throw Error(errorPrefix + 'Argument `asset` cannot be borrowed.');
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
                    trxOptions = __assign({ _compoundProvider: this._provider }, options);
                    parameters = [amount];
                    trxOptions.abi = cTokenName === constants_1.constants.cETH ? constants_1.abi.cEther : constants_1.abi.cErc20;
                    return [2 /*return*/, eth.trx(cTokenAddress, 'borrow', parameters, trxOptions)];
            }
        });
    });
}
exports.borrow = borrow;
/**
 * Repays a borrowed Ethereum asset for the user or on behalf of another
 *     Ethereum address.
 *
 * @param {string} asset A string of the asset that was borrowed (must be a
 *     supported underlying asset).
 * @param {number | string | BigNumber} amount A string, number, or BigNumber
 *     object of the amount of an asset to borrow. Use the `mantissa` boolean in
 *     the `options` parameter to indicate if this value is scaled up (so there
 *     are no decimals) or in its natural scale.
 * @param {string | null} [borrower] The Ethereum address of the borrower to
 *     repay an open borrow for. Set this to `null` if the user is repaying
 *     their own borrow.
 * @param {object} options Call options and Ethers.js overrides for the
 *     transaction.
 *
 * @returns {object} Returns an Ethers.js transaction object of the repayBorrow
 *     or repayBorrowBehalf transaction.
 */
function repayBorrow(asset, amount, borrower, options) {
    if (options === void 0) { options = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, cTokenName, cTokenAddress, method, trxOptions, parameters, underlyingAddress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _a.sent();
                    errorPrefix = 'Compound [repayBorrow] | ';
                    cTokenName = 'c' + asset;
                    cTokenAddress = constants_1.address[this._network.name][cTokenName];
                    if (!cTokenAddress || !constants_1.underlyings.includes(asset)) {
                        throw Error(errorPrefix + 'Argument `asset` is not supported.');
                    }
                    if (typeof amount !== 'number' &&
                        typeof amount !== 'string' &&
                        !ethers_1.ethers.BigNumber.isBigNumber(amount)) {
                        throw Error(errorPrefix + 'Argument `amount` must be a string, number, or BigNumber.');
                    }
                    method = ethers_1.ethers.utils.isAddress(borrower) ? 'repayBorrowBehalf' : 'repayBorrow';
                    if (borrower && method === 'repayBorrow') {
                        throw Error(errorPrefix + 'Invalid `borrower` address.');
                    }
                    if (!options.mantissa) {
                        amount = +amount;
                        amount = amount * Math.pow(10, constants_1.decimals[asset]);
                    }
                    amount = ethers_1.ethers.BigNumber.from(amount.toString());
                    trxOptions = __assign({ _compoundProvider: this._provider }, options);
                    parameters = method === 'repayBorrowBehalf' ? [borrower] : [];
                    if (!(cTokenName === constants_1.constants.cETH)) return [3 /*break*/, 2];
                    trxOptions.value = amount;
                    trxOptions.abi = constants_1.abi.cEther;
                    return [3 /*break*/, 4];
                case 2:
                    parameters.push(amount);
                    trxOptions.abi = constants_1.abi.cErc20;
                    underlyingAddress = constants_1.address[this._network.name][asset];
                    return [4 /*yield*/, eth.trx(underlyingAddress, 'approve', [cTokenAddress, amount], { _compoundProvider: this._provider, abi: constants_1.abi.cErc20 })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, eth.trx(cTokenAddress, method, parameters, trxOptions)];
            }
        });
    });
}
exports.repayBorrow = repayBorrow;
//# sourceMappingURL=cToken.js.map