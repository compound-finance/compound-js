import { ethers } from 'ethers';
import * as eth from './eth';
import * as util from './util';
declare const Compound: {
    (provider?: any, options?: any): any;
    eth: typeof eth;
    util: typeof util;
    _ethers: typeof ethers;
};
export = Compound;
