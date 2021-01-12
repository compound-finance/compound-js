
const Compound = require('../../dist/nodejs/index.js');


async function readAccountInfo() {

    const account = await Compound.api.account({
        "addresses": 'your-wallet-address-here', // you might add & require("dotenv").config() - using environment variables
        "network": "mainnet"
    });
    
    console.log(`The borrow value in ETH is: ${account.accounts[0].total_borrow_value_in_eth.value}.`)
   
}

readAccountInfo()
