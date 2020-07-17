let request: any;
let http: any;
let https: any;

export async function netId(_compound) {
  if (_compound._networkPromise) {
    await _compound._networkPromise;
  }
}
