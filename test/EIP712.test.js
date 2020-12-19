const assert = require('assert');
const Compound = require('../src/index.ts');
const ethers = require('ethers');
const providerUrl = 'http://localhost:8545';

// Mocked browser `window.ethereum` as unlocked account '0xa0df35...'
const window = { ethereum: require('./window.ethereum.json') };

const patchedAddress = '0xa0df350d2637096571f7a701cbc1c5fde30df76a';
const patchedPrivateKey = '0xb8c1b5c1d81f9475fdf2e334517d29f733bdfa40682207571b12fc1142cbf329';
const patchedSignature = '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd1c';

const signTypedDataV4Parameter = JSON.stringify({
  "domain": {
    "name": "Compound",
    "chainId": 1,
    "verifyingContract": "0xc00e94Cb662C3520282E6f5717214004A7f26888"
  },
  "primaryType": "Delegation",
  "message": {
    "delegatee": "0xa0df350d2637096571f7a701cbc1c5fde30df76a",
    "nonce": 0,
    "expiry": 10000000000
  },
  "types": {
    "EIP712Domain": [
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "chainId",
        "type": "uint256"
      },
      {
        "name": "verifyingContract",
        "type": "address"
      }
    ],
    "Delegation": [
      {
        "name": "delegatee",
        "type": "address"
      },
      {
        "name": "nonce",
        "type": "uint256"
      },
      {
        "name": "expiry",
        "type": "uint256"
      }
    ]
  }
});

module.exports = function suite() {

  it('runs EIP712.sign as browser', async function () {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);

    window.ethereum.send = function (request, callback) {
      const { method, params } = request;

      if (
        method === 'eth_signTypedData_v4' &&
        params[0] === patchedAddress &&
        params[1] === signTypedDataV4Parameter
      ) {
        callback(null, { id: undefined, jsonrpc: "2.0", result: patchedSignature });
        return;
      }

      try {
        provider.send(method, params).then((result) => {
          callback(null, { id: undefined, jsonrpc: "2.0", result });
        });
      } catch(err) {
        callback(err);
      }
    }

    const compound = new Compound(window.ethereum);

    compound._provider.getAddress = () => Promise.resolve(patchedAddress);

    const delegateSignature = await compound.createDelegateSignature(
      patchedAddress
    );

    const expectedSignature = {
      r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
      s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
      v: '0x1c'
    };

    assert.equal(delegateSignature.r, expectedSignature.r);
    assert.equal(delegateSignature.s, expectedSignature.s);
    assert.equal(delegateSignature.v, expectedSignature.v);
  });

  it('runs EIP712.sign as Node.js', async function () {
    const compound = new Compound(providerUrl, {
      privateKey: patchedPrivateKey
    });

    const delegateSignature = await compound.createDelegateSignature(
      patchedAddress
    );

    const expectedSignature = {
      r: '0x5d86ab46e1f827f07e9eb6a5955eaa2219e93f64a8c8406ace0d1f48b4c0c405',
      s: '0x710fc5e9a2f8f865739e9f149ebd8a5e8a613097676385db4f197cd0ecfa85bd',
      v: '0x1c'
    };

    assert.equal(delegateSignature.r, expectedSignature.r);
    assert.equal(delegateSignature.s, expectedSignature.s);
    assert.equal(delegateSignature.v, expectedSignature.v);
  });

}
