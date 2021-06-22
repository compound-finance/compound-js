require('@nomiclabs/hardhat-waffle');

const providerUrl = process.env.MAINNET_PROVIDER_URL;

if (!providerUrl) {
  console.error('Missing JSON RPC provider URL as environment variable `MAINNET_PROVIDER_URL`');
  process.exit(1);
}

module.exports = {
  networks: {
    hardhat: {
      // hostname: '127.0.0.1',
      // port: 8545,
      chainId: 1,
      forking: {
        url: providerUrl,
        blockNumber: 12588581,
      },
      gasPrice: 0,
      loggingEnabled: false,
    },
  },
  mocha: {
    timeout: 60000
  }
};
