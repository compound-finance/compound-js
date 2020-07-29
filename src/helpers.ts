let request: any;
let http: any;
let https: any;

/**
 * This function acts like a decorator for all methods that interact with the
 *     blockchain. In order to use the correct Compound protocol addresses, the
 *     Compound.js SDK must know which network its provider points to. This
 *     function holds up a transaction until the main constructor has determined
 *     the network ID.
 *
 * @param {Compound} _compound The instance of the Compound.js SDK.
 *
 */
export async function netId(_compound) {
  if (_compound._networkPromise) {
    await _compound._networkPromise;
  }
}
