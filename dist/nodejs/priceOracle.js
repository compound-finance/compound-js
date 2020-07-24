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
exports.getPrice = void 0;
var eth = require("./eth");
var helpers_1 = require("./helpers");
var constants_1 = require("./constants");
function validateAsset(asset, argument, errorPrefix) {
    if (typeof asset !== 'string' || asset.length < 1) {
        throw Error(errorPrefix + 'Argument `' + argument + '` must be a non-empty string.');
    }
    var assetIsCToken = asset[0] === 'c';
    var cTokenName = assetIsCToken ? asset : 'c' + asset;
    var cTokenAddress = constants_1.address[this._network.name][cTokenName];
    var underlyingName = assetIsCToken ? asset.slice(1, asset.length) : asset;
    var underlyingAddress = constants_1.address[this._network.name][underlyingName];
    if (!constants_1.cTokens.includes(cTokenName) || !constants_1.underlyings.includes(underlyingName)) {
        throw Error(errorPrefix + 'Argument `' + argument + '` is not supported.');
    }
    var underlyingDecimals = constants_1.decimals[underlyingName];
    return [assetIsCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, underlyingDecimals];
}
function cTokenExchangeRate(cTokenAddress, cTokenName, underlyingDecimals) {
    return __awaiter(this, void 0, void 0, function () {
        var address, method, options, exchangeRateCurrent, mantissa, oneCTokenInUnderlying;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    address = cTokenAddress;
                    method = 'exchangeRateCurrent';
                    options = {
                        _compoundProvider: this._provider,
                        abi: cTokenName === constants_1.constants.cETH ? constants_1.abi.cEther : constants_1.abi.cErc20
                    };
                    return [4 /*yield*/, eth.read(address, method, [], options)];
                case 1:
                    exchangeRateCurrent = _a.sent();
                    mantissa = 18 + parseInt(underlyingDecimals) - 8;
                    oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
                    return [2 /*return*/, oneCTokenInUnderlying];
            }
        });
    });
}
function getPrice(asset, inAsset) {
    if (inAsset === void 0) { inAsset = constants_1.constants.ETH; }
    return __awaiter(this, void 0, void 0, function () {
        var errorPrefix, _a, assetIsCToken, cTokenName, cTokenAddress, underlyingName, underlyingAddress, underlyingDecimals, _b, inAssetIsCToken, inAssetCTokenName, inAssetCTokenAddress, inAssetUnderlyingName, inAssetUnderlyingAddress, inAssetUnderlyingDecimals, priceOracleAddress, trxOptions, priceMantissa, inAssetPriceMantissa, assetUnderlyingPrice, inAssetUnderlyingPrice, assetCTokensInUnderlying, inAssetCTokensInUnderlying, result, assetInOther, assetInOther, assetInOther, cTokensInUnderlying;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, helpers_1.netId(this)];
                case 1:
                    _c.sent();
                    errorPrefix = 'Compound [getPrice] | ';
                    _a = validateAsset.bind(this)(asset, 'asset', errorPrefix), assetIsCToken = _a[0], cTokenName = _a[1], cTokenAddress = _a[2], underlyingName = _a[3], underlyingAddress = _a[4], underlyingDecimals = _a[5];
                    _b = validateAsset.bind(this)(inAsset, 'inAsset', errorPrefix), inAssetIsCToken = _b[0], inAssetCTokenName = _b[1], inAssetCTokenAddress = _b[2], inAssetUnderlyingName = _b[3], inAssetUnderlyingAddress = _b[4], inAssetUnderlyingDecimals = _b[5];
                    priceOracleAddress = constants_1.address[this._network.name].PriceOracle;
                    trxOptions = {
                        _compoundProvider: this._provider,
                        abi: constants_1.abi.PriceOracle
                    };
                    return [4 /*yield*/, eth.read(priceOracleAddress, 'getUnderlyingPrice', [cTokenAddress], trxOptions)];
                case 2:
                    priceMantissa = _c.sent();
                    inAssetPriceMantissa = 1e18;
                    if (!(inAssetUnderlyingName !== constants_1.constants.ETH)) return [3 /*break*/, 4];
                    return [4 /*yield*/, eth.read(priceOracleAddress, 'getUnderlyingPrice', [inAssetCTokenAddress], trxOptions)];
                case 3:
                    inAssetPriceMantissa = _c.sent();
                    _c.label = 4;
                case 4:
                    assetUnderlyingPrice = priceMantissa / (1e18 / (Math.pow(10, underlyingDecimals - 18)));
                    inAssetUnderlyingPrice = inAssetPriceMantissa / (1e18 / (Math.pow(10, inAssetUnderlyingDecimals - 18)));
                    if (!assetIsCToken) return [3 /*break*/, 6];
                    return [4 /*yield*/, cTokenExchangeRate.bind(this)(cTokenAddress, cTokenName, underlyingDecimals)];
                case 5:
                    assetCTokensInUnderlying = _c.sent();
                    _c.label = 6;
                case 6:
                    if (!inAssetIsCToken) return [3 /*break*/, 8];
                    return [4 /*yield*/, cTokenExchangeRate.bind(this)(inAssetCTokenAddress, inAssetCTokenName, inAssetUnderlyingDecimals)];
                case 7:
                    inAssetCTokensInUnderlying = _c.sent();
                    _c.label = 8;
                case 8:
                    if (!assetIsCToken && !inAssetIsCToken) {
                        result = assetUnderlyingPrice / inAssetUnderlyingPrice;
                    }
                    else if (assetIsCToken && !inAssetIsCToken) {
                        assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
                        result = assetInOther * assetCTokensInUnderlying;
                    }
                    else if (!assetIsCToken && inAssetIsCToken) {
                        assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
                        result = assetInOther / inAssetCTokensInUnderlying;
                    }
                    else {
                        assetInOther = assetUnderlyingPrice / inAssetUnderlyingPrice;
                        cTokensInUnderlying = assetInOther / assetCTokensInUnderlying;
                        result = inAssetCTokensInUnderlying * cTokensInUnderlying;
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.getPrice = getPrice;
//# sourceMappingURL=priceOracle.js.map