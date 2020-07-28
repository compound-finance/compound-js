// Example of fetching a Compound protocol contract address with Compound.js
const Compound = require('../../dist/nodejs/index.js');

const batAddress = Compound.util.getAddress(Compound.BAT);
const cbatAddress = Compound.util.getAddress(Compound.cBAT);
const cEthAddressRopsten = Compound.util.getAddress(Compound.cETH, 'ropsten');

console.log('BAT (mainnet)', batAddress);
console.log('cBAT (mainnet)', cbatAddress);

console.log('cETH (ropsten)', cEthAddressRopsten);
