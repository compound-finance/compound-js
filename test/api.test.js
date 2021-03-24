const assert = require('assert');
const api = require('../src/api.ts');

module.exports = function suite() {

  it('runs api.account', async function () {

    const myAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';
    const response = await api.account({
      "addresses": myAddress,
      "network": "ropsten"
    });

    const address = response.accounts[0].address.toLowerCase();
    const error = response.error;

    const expectedAddress = myAddress.toLowerCase();
    const expectedError = null;

    assert.equal(address, expectedAddress);
    assert.equal(error, expectedError);
  });

  it('runs api.cToken', async function () {
    const cDaiMainnetAddress = '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643';
    const response = await api.cToken({
      "addresses": cDaiMainnetAddress
    });

    const name = response.cToken[0].name;
    const error = response.error;

    const expectedName = 'Compound Dai';
    const expectedError = null;

    assert.equal(name, expectedName);
    assert.equal(error, expectedError);
  });

  it('runs api.marketHistory', async function () {
    const cUsdcMainnetAddress = '0x39aa39c021dfbae8fac545936693ac917d5e7563';
    const response = await api.marketHistory({
      "asset": cUsdcMainnetAddress,
      "min_block_timestamp": 1588598520,
      "max_block_timestamp": 1589000000,
      "num_buckets": 1,
    });

    const borrowRate = response.borrow_rates[0].rate.toFixed(2);
    const error = response.error.error_code;

    const expectedBorrowRate = '0.04';
    const expectedError = 0;

    assert.equal(borrowRate, expectedBorrowRate);
    assert.equal(error, expectedError);
  });

  it('runs api.governance proposals', async function () {
    const response = await api.governance(
      { "proposal_ids": [ 20 ] }, 'proposals'
    );

    const againstVotes = response.proposals[0].against_votes;
    const error = response.error;

    const expectedAgainstVotes = '1.975530301542635623';
    const expectedError = null;

    assert.equal(againstVotes, expectedAgainstVotes);
    assert.equal(error, expectedError);
  });

  it('runs api.governance voteReceipts', async function () {
    const response = await api.governance(
      { "proposal_id": 20 }, 'voteReceipts'
    );

    const reciepts = response.proposal_vote_receipts.length;
    const error = response.error;

    const expectedReciepts = 10;
    const expectedError = null;

    assert.equal(reciepts, expectedReciepts);
    assert.equal(error, expectedError);
  });

  it('runs api.governance accounts', async function () {
    const myAddress = '0x8169522c2c57883e8ef80c498aab7820da539806';
    const response = await api.governance(
      { "addresses": myAddress }, 'accounts'
    );

    const address = response.accounts[0].address;
    const error = response.error;

    const expectedAddress = myAddress;
    const expectedError = null;

    assert.equal(address, expectedAddress);
    assert.equal(error, expectedError);
  });

  it('fails api returns 500', async function () {
    const expectedErrorMessage = 'Compound [api] [Market History] | Invalid request made to the Compound API.';

    let errorMessage;
    try {
      const response = await api.marketHistory({
        "network": "rinkeby",
        "asset": '0xinvalid',
        "num_buckets": 2,
      });
    } catch({ error }) {
      errorMessage = error.toString();
    }

    assert.equal(errorMessage, expectedErrorMessage);
  });

}
