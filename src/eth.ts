import { ethers } from 'ethers';
// import { request } from './util';

interface CallOptions {
  abi?: string | object[];
  provider?: string;
  network?: string;
  from?: number | string;
  gas?: number;
  gasPrice?: number;
  gasLimit?: number;
  value?: number | string;
  data?: number | string;
  chainId?: number;
  nonce?: number;
  // blockNumber?: string;
  // id?: number;
}

export function read(
  address: string,
  method: string,
  parameters: any[] = [],
  options: CallOptions = {}
): Promise<any> {
  return new Promise<any>((resolve: Function, reject: Function) => {
    const network = options.network || 'mainnet';
    const provider = options.provider ?
      new ethers.providers.JsonRpcProvider(options.provider) :
      ethers.getDefaultProvider(network);
    const overrides = {
      gasPrice: options.gasPrice,
      nonce: options.nonce,
      value: options.value,
      chainId: options.chainId,
      from: options.from,
      gasLimit: options.gasLimit,
    };
    parameters.push(overrides);

    let contract;
    let abi: any;
    if (options.abi) {
      // Assumes `method` is a string of the member name
      // Assumes `abi` is a JSON object
      abi = options.abi;
      contract = new ethers.Contract(address, abi, provider);
    } else {
      // Assumes `method` is a string of the member definition
      abi = [ method ];
      contract = new ethers.Contract(address, abi, provider);
      method = Object.keys(contract.functions)[1];
    }

    contract.callStatic[method].apply(null, parameters).then((result) => {
      resolve(result);
    }).catch((error) => {
      reject(error);
    });
  });
};
