// Example of calling JSON RPC's eth_call with Compound.js
const Compound = require('../../dist/nodejs/index.js');

// mainnet
const cEthAddress = '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5';

(async function() {

  const srpb = await Compound.eth.read(
    cEthAddress,
    'function supplyRatePerBlock() returns (uint256)',
    // [], // [optional] parameters
    // {}  // [optional] call options, provider, network, plus ethers "overrides"
  );

  console.log('cETH market supply rate per block:', srpb.toString());

})().catch(console.error);
