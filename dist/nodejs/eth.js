"use strict";
exports.__esModule = true;
exports.read = void 0;
var ethers_1 = require("ethers");
function read(address, method, parameters, options) {
    if (parameters === void 0) { parameters = []; }
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        var network = options.network || 'mainnet';
        var provider = options.provider ?
            new ethers_1.ethers.providers.JsonRpcProvider(options.provider) :
            ethers_1.ethers.getDefaultProvider(network);
        var overrides = {
            gasPrice: options.gasPrice,
            nonce: options.nonce,
            value: options.value,
            chainId: options.chainId,
            from: options.from,
            gasLimit: options.gasLimit
        };
        parameters.push(overrides);
        var contract;
        var abi;
        if (options.abi) {
            // Assumes `method` is a string of the member name
            // Assumes `abi` is a JSON object
            abi = options.abi;
            contract = new ethers_1.ethers.Contract(address, abi, provider);
        }
        else {
            // Assumes `method` is a string of the member definition
            abi = [method];
            contract = new ethers_1.ethers.Contract(address, abi, provider);
            method = Object.keys(contract.functions)[1];
        }
        contract.callStatic[method].apply(null, parameters).then(function (result) {
            resolve(result);
        })["catch"](function (error) {
            reject(error);
        });
    });
}
exports.read = read;
;
//# sourceMappingURL=eth.js.map