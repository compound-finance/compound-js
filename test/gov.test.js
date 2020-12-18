const assert = require('assert');
const ethers = require('ethers');
const Compound = require('../src/index.ts');
const providerUrl = 'http://localhost:8545';

// castVote
// castVoteBySig
// createVoteSignature
const unlockedAddress = '0xa0df350d2637096571F7A701CBc1C5fdE30dF76A';
const unlockedPk = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';

module.exports = function suite([ publicKeys, privateKeys ]) {

  const acc1 = { address: publicKeys[0], privateKey: privateKeys[0] };

  const compound = new Compound(providerUrl, {
    privateKey: acc1.privateKey
  });

  it('runs gov.castVote', async function () {
    let address, method, params, votingIsClosed;

    const unpatched = Compound.eth.trx;
    Compound.eth.trx = function() {
      address = arguments[0];
      method = arguments[1];
      params = arguments[2];
      return unpatched.apply(this, arguments);
    }

    try {
      const voteTrx = await compound.castVote(20, true, {
        gasLimit: ethers.utils.parseUnits('100000', 'wei')
      });
      const receipt = await voteTrx.wait(1);
    } catch(err) {
      votingIsClosed = err.error.error.data.stack.includes('GovernorAlpha::_castVote: voting is closed');
    }

    const addressExpected = Compound.util.getAddress('GovernorAlpha');
    const methodExpected = 'castVote';
    const paramsExpected = [ 20, true ];

    assert.equal(votingIsClosed, true);
    assert.equal(address, addressExpected);
    assert.equal(method, methodExpected);
    assert.equal(params[0], paramsExpected[0]);
    assert.equal(params[1], paramsExpected[1]);
  });

  it('fails gov.castVote bad proposalId', async function () {
    const errorMessage = 'Compound [castVote] | Argument `proposalId` must be an integer.';
    try {
      const voteTrx = await compound.castVote(null, true); // bad proposalId
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails gov.castVote bad support', async function () {
    const errorMessage = 'Compound [castVote] | Argument `support` must be a boolean.';
    try {
      const voteTrx = await compound.castVote(11, 'abc'); // bad support
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs gov.castVoteBySig', async function () {
    let address, method, params, votingIsClosed;

    const unpatched = Compound.eth.trx;
    Compound.eth.trx = function() {
      address = arguments[0];
      method = arguments[1];
      params = arguments[2];
      return unpatched.apply(this, arguments);
    }

    const proposalId = 20;
    const support = true;
    const voteSignature = {
      r: '0x8c6113af4858a5c423065261e51a6f2652072e123d1ca849e05f75636f766680',
      s: '0x1552df4943100711f6e0517c98bb8a4b81b4a2ddc5427c0aa4b8240a72cc0839',
      v: '0x1c'
    };

    try {
      const trx = await compound.castVoteBySig(
        proposalId,
        support,
        voteSignature,
        { gasLimit: ethers.utils.parseUnits('500000', 'wei') }
      );
      const receipt = await trx.wait(1);
    } catch({ error }) {
      votingIsClosed = error.error.data.stack.includes('GovernorAlpha::_castVote: voting is closed');
    }

    const addressExpected = Compound.util.getAddress('GovernorAlpha');
    const methodExpected = 'castVoteBySig';
    const paramsExpected = [
      20,
      true,
      '0x1c',
      '0x8c6113af4858a5c423065261e51a6f2652072e123d1ca849e05f75636f766680',
      '0x1552df4943100711f6e0517c98bb8a4b81b4a2ddc5427c0aa4b8240a72cc0839'
    ];

    assert.equal(votingIsClosed, true);
    assert.equal(address, addressExpected);
    assert.equal(method, methodExpected);
    assert.equal(params[0], paramsExpected[0]);
    assert.equal(params[1], paramsExpected[1]);
    assert.equal(params[2], paramsExpected[2]);
    assert.equal(params[3], paramsExpected[3]);
    assert.equal(params[4], paramsExpected[4]);
  });

  it('fails gov.castVoteBySig bad proposalId', async function () {
    const proposalId = null;
    const support = true;
    const voteSignature = {
      r: '0x8c6113af4858a5c423065261e51a6f2652072e123d1ca849e05f75636f766680',
      s: '0x1552df4943100711f6e0517c98bb8a4b81b4a2ddc5427c0aa4b8240a72cc0839',
      v: '0x1c'
    };

    const errorMessage = 'Compound [castVoteBySig] | Argument `proposalId` must be an integer.';
    try {
      const trx = await compound.castVoteBySig(
        proposalId, // bad proposalId
        support,
        voteSignature
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails gov.castVoteBySig bad support', async function () {
    const proposalId = 20;
    const support = 'abc';
    const voteSignature = {
      r: '0x8c6113af4858a5c423065261e51a6f2652072e123d1ca849e05f75636f766680',
      s: '0x1552df4943100711f6e0517c98bb8a4b81b4a2ddc5427c0aa4b8240a72cc0839',
      v: '0x1c'
    };

    const errorMessage = 'Compound [castVoteBySig] | Argument `support` must be a boolean.';
    try {
      const trx = await compound.castVoteBySig(
        proposalId,
        support, // bad support
        voteSignature
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('fails gov.castVoteBySig bad signature', async function () {
    const proposalId = 20;
    const support = true;
    const voteSignature = 'abc';

    const errorMessage = 'Compound [castVoteBySig] | Argument `signature` must be an object that contains the v, r, and s pieces of an EIP-712 signature.';
    try {
      const trx = await compound.castVoteBySig(
        proposalId,
        support,
        voteSignature // bad signature
      );
    } catch (e) {
      assert.equal(e.message, errorMessage);
    }
  });

  it('runs gov.createVoteSignature', async function () {
    const _compound = new Compound(providerUrl, {
      privateKey: unlockedPk
    });

    const voteSignature = await _compound.createVoteSignature(
      20,
      true
    );

    const expectedSignature = {
      r: '0x8c6113af4858a5c423065261e51a6f2652072e123d1ca849e05f75636f766680',
      s: '0x1552df4943100711f6e0517c98bb8a4b81b4a2ddc5427c0aa4b8240a72cc0839',
      v: '0x1c'
    }

    assert.equal(voteSignature.r, expectedSignature.r);
    assert.equal(voteSignature.s, expectedSignature.s);
    assert.equal(voteSignature.v, expectedSignature.v);
  });

}