import {
  Signer as AbstractSigner
} from '@ethersproject/abstract-signer/lib/index';
import {
  FallbackProvider
} from '@ethersproject/providers/lib/fallback-provider';
import {
  BlockTag, TransactionRequest, TransactionResponse
} from '@ethersproject/abstract-provider';
import { Deferrable } from '@ethersproject/properties';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { ethers } from 'ethers';
import * as eth from '../eth';
import * as util from '../util';
import * as comp from '../comp';
import * as api from '../api';

// =-=-=-=-=-= /src/index.ts =-=-=-=-=-=

export interface CompoundSDK extends Constants {
  (provider?: string | Provider, options?: CompoundOptions): CompoundInstance;
  new(provider?: string | Provider, options?: CompoundOptions): CompoundInstance;
  eth: typeof eth;
  api: typeof api;
  util: typeof util;
  _ethers: typeof ethers;
  decimals: Decimals;
  comp: {
        getCompBalance: typeof comp.getCompBalance;
        getCompAccrued: typeof comp.getCompAccrued;
  };
}

export interface CompoundInstance {
  _networkPromise: Promise<ProviderNetwork>;
}

export interface CompoundOptions {
  privateKey?: string;
  mnemonic?: string;
  provider?: Provider | string;
}


// =-=-=-=-=-= /src/eth.ts =-=-=-=-=-=

export interface AbiType {
  internalType?: string;
  name?: string;
  type?: string;
  components?: AbiType[],
}

export interface AbiItem {
  constant?: boolean;
  inputs?: AbiType[];
  name?: string;
  outputs?: AbiType[];
  payable?: boolean;
  stateMutability?: string;
  type?: string;
}

export interface CallOptions {
  _compoundProvider?: Provider;
  abi?: string | string[] | AbiItem[];
  provider?: Provider | string;
  network?: string;
  from?: number | string;
  gasPrice?: number;
  gasLimit?: number;
  value?: number | string | BigNumber;
  data?: number | string;
  chainId?: number;
  nonce?: number;
  privateKey?: string;
  mnemonic?: string;
  mantissa?: boolean;
  // blockNumber?: string;
  // id?: number;
}

export interface EthersTrx {
  nonce: number;
  gasPrice: BigNumber;
  gasLimit: BigNumber;
  to: string;
  value: BigNumber;
  data: string;
  chainId: number;
  from: string;
  wait: void;
}

export interface TrxError {
  message: string;
  error: Error;
  method: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: any[];
}

export type TrxResponse = EthersTrx | TrxError;

export interface Connection {
  url?: string;
}

export interface Network {
  chainId: number,
  name: string
}

export interface ProviderNetwork {
  id?: number;
  name?: string;
}

type GenericGetBalance = (
    addressOrName: string | number | Promise<string | number>,
    blockTag?: string | number | Promise<string | number>
) => Promise<BigNumber>;

type GenericGetTransactionCount = (
  addressOrName: string | number | Promise<string>,
  blockTag?: BlockTag | Promise<BlockTag>
) => Promise<number>;

type GenericSendTransaction = (
  transaction: string | Promise<string> | Deferrable<TransactionRequest>
) => Promise<TransactionResponse>;

export interface Provider extends AbstractSigner, FallbackProvider {
  connection?: Connection;
  _network: Network;
  call: AbstractSigner['call'] | FallbackProvider['call'];
  getBalance: GenericGetBalance;
  getTransactionCount: GenericGetTransactionCount;
  resolveName: AbstractSigner['resolveName'] | FallbackProvider['resolveName'];
  sendTransaction: GenericSendTransaction;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send?: (method: string, parameters: string[]) => any;
}


// =-=-=-=-=-= /src/api.ts =-=-=-=-=-=

export interface APIResponse {
  error?: string;
  responseCode?: number;
  responseMessage?: string;
}

export interface precise {
  value: string;
}

export interface PaginationSummary {
  page_number?: number;
  page_size?: number;
  total_entries?: number;
  total_pages?: number;
}

export interface Account {
   address?: string;
   health?: precise;
   tokens?: AccountCToken[];
   total_borrow_value_in_eth?: precise;
   total_collateral_value_in_eth?: precise;
}

export interface AccountCToken {
  address?: string;
  symbol?: string;
  borrow_balance_underlying?: precise;
  lifetime_borrow_interest_accrued?: precise;
  lifetime_supply_interest_accrued?: precise;
  supply_balance_underlying?: precise;
}

export enum AccountError {
  NO_ERROR = "0",
  INTERNAL_ERROR = "1",
  INVALID_PAGE_NUMBER = "2",
  INVALID_PAGE_SIZE = "3"
}

export interface AccountServiceRequest {
  addresses?: string[] | string;
  min_borrow_value_in_eth?: precise;
  max_health?: precise;
  block_number?: number;
  block_timestamp?: number;
  page_size?: number;
  page_number?: number;
  network?: string;
}

export interface AccountServiceResponse extends APIResponse, AccountServiceRequest {
  accounts?: Account[];
  pagination_summary?: PaginationSummary;
}

export interface CTokenServiceRequest {
  addresses?: string[] | string;
  block_number?: number;
  block_timestamp?: number;
  meta?: boolean;
  network?: string;
}

export interface MarketHistoryServiceRequest {
  asset?: string;
  min_block_timestamp?: number;
  max_block_timestamp?: number;
  num_buckets?: number;
  network?: string;
}


export interface GovernanceServiceRequest {
  proposal_ids?: number[];
  state?: string;
  with_detail?: boolean;
  page_size?: number;
  page_number?: number;
  network?: string;
}

export type APIRequest = AccountServiceRequest |
  CTokenServiceRequest | MarketHistoryServiceRequest | GovernanceServiceRequest;


// =-=-=-=-=-= /src/EIP712.ts =-=-=-=-=-=

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

interface SimpleEthersProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jsonRpcFetchFunc(method: string, parameters: any[]);
}

export interface SimpleEthersSigner {
  _signingKey();
  getAddress();
  provider?: SimpleEthersProvider;
}


// =-=-=-=-=-= /src/constants.ts =-=-=-=-=-=

 export interface Constants {
        PriceFeed: string;
        Maximillion: string;
        CompoundLens: string;
        GovernorAlpha: string;
        Comptroller: string;
        Reservoir: string;
        KNC: string;
        LINK: string;
        BTC: string;
        cBAT: string;
        cCOMP: string;
        cDAI: string;
        cETH: string;
        cREP: string;
        cSAI: string;
        cUNI: string;
        cUSDC: string;
        cUSDT: string;
        cWBTC: string;
        cZRX: string;
        BAT: string;
        COMP: string;
        DAI: string;
        ETH: string;
        REP: string;
        SAI: string;
        UNI: string;
        USDC: string;
        USDT: string;
        WBTC: string;
        ZRX: string;
}

export interface Decimals {
  cBAT: number;
  cCOMP: number;
  cDAI: number;
  cETH: number;
  cREP: number;
  cSAI: number;
  cUNI: number;
  cUSDC: number;
  cUSDT: number;
  cWBTC: number;
  cZRX: number;
  BAT: number;
  COMP: number;
  DAI: number;
  ETH: number;
  REP: number;
  SAI: number;
  UNI: number;
  USDC: number;
  USDT: number;
  WBTC: number;
  ZRX: number;
  KNC: number;
  LINK: number;
  BTC: number;
}
