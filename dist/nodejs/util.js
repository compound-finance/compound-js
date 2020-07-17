"use strict";
exports.__esModule = true;
exports.getAddress = void 0;
var constants_1 = require("./constants");
function getAddress(contract, network) {
    if (network === void 0) { network = 'mainnet'; }
    return constants_1.address[network][contract];
}
exports.getAddress = getAddress;
//# sourceMappingURL=util.js.map