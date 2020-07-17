import { address } from './constants';

export function getAddress(contract, network='mainnet') {
  return address[network][contract];
}
