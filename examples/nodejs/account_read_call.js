// // dotenv would be an external dependency and would need to be installed for your project
// require("dotenv").config(); // this ensures process.env.... contains your .env file configuration values

const Compound = require('../../dist/nodejs/index.js');


async function readAccountInfo() {

    const account = await Compound.api.account({
        "addresses": 'process.env.WALLET_ADDRESS', 
        "network": "mainnet"
    });
    
    console.log(`The borrow value in ETH is: ${account.accounts[0].total_borrow_value_in_eth.value}.`)
   
}

readAccountInfo()