import * as eth from './eth';
import * as util from './util';
declare const Compound: {
    (provider?: any, options?: any): any;
    eth: typeof eth;
    util: typeof util;
};
export = Compound;
