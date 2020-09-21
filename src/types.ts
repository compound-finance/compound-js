export interface Signature {
  r : string;
  s : string;
  v : string;
}

export interface EIP712Type {
  name: string;
  type: string;
}

export interface EIP712Domain {
  name: string;
  chainId: number;
  verifyingContract: string;
}

export interface VoteTypes {
  EIP712Domain: EIP712Type[];
  Ballot: EIP712Type[]
}

export interface DelegateTypes {
  EIP712Domain: EIP712Type[];
  Delegation: EIP712Type[];
}

export type EIP712Types = VoteTypes | DelegateTypes;

export interface DelegateSignatureMessage {
  delegatee: string;
  nonce: number;
  expiry: number;
}

export interface VoteSignatureMessage {
  proposalId: number;
  support: boolean;
}

export type EIP712Message = DelegateSignatureMessage | VoteSignatureMessage;
