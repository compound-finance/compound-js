/** 
 * Example of redeeming ETH from the Compound protocol with Compound.js
 *
 * Run ganache-cli in another command line window before running this script. Be
 *     sure to fork mainnet.

ganache-cli \
  -f https://mainnet.infura.io/v3/_YOUR_INFURA_ID_ \
  -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
  -i 1

 */

const Compound = require('../../dist/nodejs/index.js');
const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';

const compound = new Compound('http://localhost:8545', { privateKey });

// Ethers.js overrides are an optional 3rd parameter for `supply` or `redeem`
const trxOptions = { gasLimit: 250000, mantissa: false };

(async function() {

  console.log('Supplying ETH to the Compound protocol...');
  const trx1 = await compound.supply(Compound.ETH, 1);
  console.log('Supply transaction: ', trx1);

  console.log('Redeeming ETH...');
  const trx2 = await compound.redeem(Compound.ETH, 1); // also accepts cToken args
  console.log('Redeem transaction: ', trx2);

})().catch(console.error);
