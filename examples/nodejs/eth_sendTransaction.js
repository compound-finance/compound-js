/** 
 * Example of calling JSON RPC's eth_sendTransaction with Compound.js
 *
 * Run ganache-cli in another command line window before running this script. Be
 *     sure to fork mainnet.

ganache-cli \
  -f https://mainnet.infura.io/v3/_YOUR_INFURA_ID_ \
  -m "clutch captain shoe salt awake harvest setup primary inmate ugly among become" \
  -i 1

 */

const Compound = require('../../dist/nodejs/index.js');

const oneEthInWei = '1000000000000000000';
const cEthAddress = Compound.util.getAddress(Compound.cETH);
const provider = 'http://localhost:8545';
const privateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
// const mnemonic = 'clutch captain shoe salt awake harvest setup primary inmate ugly among become';

(async function() {
  console.log('Supplying ETH to the Compound Protocol...');

  // Mint some cETH by supplying ETH to the Compound Protocol
  const trx = await Compound.eth.trx(
    cEthAddress,
    'function mint() payable',
    [],
    {
      provider,
      gasLimit: 250000,
      value: oneEthInWei,
      privateKey,
      // mnemonic,
    }
  );

  // const result = await trx.wait(1); // JSON object of trx info, once mined

  console.log('Ethers.js transaction object', trx);
})().catch(console.error);
