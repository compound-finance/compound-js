import * as eth from './eth';

const Factory = {
  Compound: class {
    constructor() {}
  },
  eth,
}

Object.assign(module.exports, Factory);
