// Example of fetching prices from the Compound protocol's open price feed using
// Compound.js
const Compound = require('../../dist/nodejs/index.js');
const compound = new Compound();

let price;
const main = async () => {

  price = await compound.getPrice(Compound.BAT, Compound.USDC);
  console.log('BAT in USDC', price);

  price = await compound.getPrice(Compound.cBAT, Compound.USDC);
  console.log('cBAT in USDC', price);

  price = await compound.getPrice(Compound.BAT, Compound.cUSDC);
  console.log('BAT in cUSDC', price);

  price = await compound.getPrice(Compound.BAT);
  console.log('BAT in ETH', price);

}

main().catch((err) => {
  console.error(err)
});
