// TODO: Needs babel config in parent dir, that currently messes with the build
// process so I deleted it.
// TODO: Get mock working for ethers so we don't make real calls during tests.

import * as eth from '../src/eth';
import { ethers } from 'ethers';

const cUsdtAddress = '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9';

const mockEthersContract = function (address, abi, provider) {
  ethersContract = new ethers.Contract(address, abi, provider);
  const staticMethods = Object.keys(ethersContract.callStatic);

  this.functions = ethersContract.functions;

  staticMethods.forEach((m) => {
    this.callStatic[m] = () => {
      if (true) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(false);
      }
    };
  });

  return this;
};

test('Read 1', async () => {
  const spy = jest.spyOn(ethers, 'Contract');
  spy.mockReturnValue(mockEthersContract);

  let result = await eth.read(
    cUsdtAddress,
    'function supplyRatePerBlock() returns (uint256)',
    // [], // [optional] parameters
    // {}  // [optional] call options, provider, network, plus ethers "overrides"
  );

  expect(result).toBe(true);

  spy.mockRestore();
});
