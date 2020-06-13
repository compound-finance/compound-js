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
}
export declare function read(address: string, method: string, parameters?: any[], options?: CallOptions): Promise<any>;
export {};
