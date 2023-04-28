require('@nomiclabs/hardhat-waffle');

const providerUrl = process.env.MAINNET_PROVIDER_URL;

if (!providerUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `MAINNET_PROVIDER_URL`');
  process.exit(1);
}

module.exports = {
  networks: {
    hardhat: {
      chainId: 1,
      forking: {
        url: providerUrl,
        blockNumber: 16926000,
      },
      gasPrice: 0,
      loggingEnabled: false,
    },
  },
  mocha: {
    timeout: 60000
  }
};
