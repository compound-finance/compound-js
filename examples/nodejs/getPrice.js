// Example of fetching prices from the Compound protocol's open price feed using
// Compound.js
const Compound = require('../../dist/nodejs/index.js');
const compound = new Compound();

let price;
(async function() {

  price = await compound.getPrice(Compound.BAT);
  console.log('BAT in USDC', price);

  price = await compound.getPrice(Compound.cBAT);
  console.log('cBAT in USDC', price);

  price = await compound.getPrice(Compound.BAT, Compound.cUSDC);
  console.log('BAT in cUSDC', price);

  price = await compound.getPrice(Compound.BAT, Compound.ETH);
  console.log('BAT in ETH', price);

})().catch(console.error);
