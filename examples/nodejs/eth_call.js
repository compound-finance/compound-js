// Example of calling JSON RPC's eth_call with Compound.js
const Compound = require('../../dist/nodejs/index.js');

const cEthAddress = Compound.util.getAddress(Compound.cETH);

(async function() {

  const srpb = await Compound.eth.read(
    cEthAddress,
    'function supplyRatePerBlock() returns (uint256)',
    // [], // [optional] parameters
    // {}  // [optional] call options, provider, network, plus ethers "overrides"
  );

  console.log('cETH market supply rate per block:', srpb.toString());

})().catch(console.error);
