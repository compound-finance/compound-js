// Based on
// https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.js

import { ethers } from 'ethers';
import {
  SimpleEthersSigner,
  EIP712Domain,
  EIP712Message,
  EIP712Types,
  Signature,
} from './types';

function abiRawEncode(encTypes, encValues) {
  const hexStr = ethers.utils.defaultAbiCoder.encode(encTypes, encValues);
  return Buffer.from(hexStr.slice(2, hexStr.length), 'hex');
}

function keccak256(arg) {
  const hexStr = ethers.utils.keccak256(arg);
  return Buffer.from(hexStr.slice(2, hexStr.length), 'hex');
}

// Recursively finds all the dependencies of a type
function dependencies(primaryType, found = [], types = {}) {
  if (found.includes(primaryType)) {
    return found;
  }
  if (types[primaryType] === undefined) {
    return found;
  }
  found.push(primaryType);
  for (const field of types[primaryType]) {
    for (const dep of dependencies(field.type, found)) {
      if (!found.includes(dep)) {
        found.push(dep);
      }
    }
  }
  return found;
}

function encodeType(primaryType, types = {}) {
  // Get dependencies primary first, then alphabetical
  let deps = dependencies(primaryType);
  deps = deps.filter(t => t != primaryType);
  deps = [primaryType].concat(deps.sort());

  // Format as a string with fields
  let result = '';
  for (const type of deps) {
    if (!types[type])
      throw new Error(`Type '${type}' not defined in types (${JSON.stringify(types)})`);
    result += `${type}(${types[type].map(({ name, type }) => `${type} ${name}`).join(',')})`;
  }
  return result;
}

function typeHash(primaryType, types = {}) {
  return keccak256(Buffer.from(encodeType(primaryType, types)));
}

function encodeData(primaryType, data, types = {}) {
  const encTypes = [];
  const encValues = [];

  // Add typehash
  encTypes.push('bytes32');
  encValues.push(typeHash(primaryType, types));

  // Add field contents
  for (const field of types[primaryType]) {
    let value = data[field.name];
    if (field.type == 'string' || field.type == 'bytes') {
      encTypes.push('bytes32');
      value = keccak256(Buffer.from(value));
      encValues.push(value);
    } else if (types[field.type] !== undefined) {
      encTypes.push('bytes32');
      value = keccak256(encodeData(field.type, value, types));
      encValues.push(value);
    } else if (field.type.lastIndexOf(']') === field.type.length - 1) {
      throw 'TODO: Arrays currently unimplemented in encodeData';
    } else {
      encTypes.push(field.type);
      encValues.push(value);
    }
  }

  return abiRawEncode(encTypes, encValues);
}

function domainSeparator(domain) {
  const types = {
    EIP712Domain: [
      {name: 'name', type: 'string'},
      {name: 'version', type: 'string'},
      {name: 'chainId', type: 'uint256'},
      {name: 'verifyingContract', type: 'address'},
      {name: 'salt', type: 'bytes32'}
    ].filter(a => domain[a.name])
  };
  return keccak256(encodeData('EIP712Domain', domain, types));
}

function structHash(primaryType, data, types = {}) {
  return keccak256(encodeData(primaryType, data, types));
}

function digestToSign(domain, primaryType, message, types = {}) {
  return keccak256(
    Buffer.concat([
      Buffer.from('1901', 'hex'),
      domainSeparator(domain),
      structHash(primaryType, message, types),
    ])
  );
}

export async function sign(
  domain: EIP712Domain,
  primaryType: string,
  message: EIP712Message,
  types: EIP712Types,
  signer: SimpleEthersSigner
) : Promise<Signature> {
  let signature;

  try {
    if (signer._signingKey) {
      const digest = digestToSign(domain, primaryType, message, types);
      signature = signer._signingKey().signDigest(digest);
      signature.v = '0x' + (signature.v).toString(16);
    } else {
      const address = await signer.getAddress();
      const msgParams = JSON.stringify({ domain, primaryType, message, types });

      signature = await signer.provider.jsonRpcFetchFunc(
        'eth_signTypedData_v4',
        [ address, msgParams ]
      );

      const r = '0x' + signature.substring(2).substring(0, 64);
      const s = '0x' + signature.substring(2).substring(64, 128);
      const v = '0x' + signature.substring(2).substring(128, 130);

      signature = { r, s, v };
    }
  } catch(e) {
    throw new Error(e);
  }

  return signature;
}
