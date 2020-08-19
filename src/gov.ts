import { ethers } from 'ethers';
import * as eth from './eth';
import { netId } from './helpers';
import { address, abi } from './constants';

/**
 * Submit a vote on a Compound Governance proposal.
 *
 * @param {String} proposalId The ID of the proposal to vote on. This is an
 *     auto-incrementing integer in the Governor Alpha contract.
 *
 * @returns {object} Returns an Ethers.js transaction object of the vote
 *     transaction.
 */
export async function castVote(proposalId: number, support: boolean, options: any = {}) {
  await netId(this);

  const errorPrefix = 'Compound [castVote] | ';

  if (typeof proposalId !== 'number') {
    throw Error(errorPrefix + 'Argument `proposalId` must be an integer.');
  }

  if (typeof support !== 'boolean') {
    throw Error(errorPrefix + 'Argument `support` must be a boolean.');
  }

  const governorAddress = address[this._network.name].GovernorAlpha;
  const trxOptions: any = {
    _compoundProvider: this._provider,
    abi: abi.GovernorAlpha,
  };
  const parameters = [ proposalId, support ];
  const method = 'castVote';

  return eth.trx(governorAddress, method, parameters, trxOptions);
}
