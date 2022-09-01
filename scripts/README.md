# Scripts

These scripts are for build functionality.

## Compound Docs

To build the Compound docs, `npm run docs` or `node ./scripts/compound-docs.js`. Move the contents of `/scripts/out.md` to the markdown files in the [Compound docs website repository](https://github.com/compound-finance/compound-finance.github.io).

## Comet Spider

Run `node scripts/comet-spider.js` to pull in all the Comet addresses from supported networks. Add new networks in the top of the script. It writes to `src/comet-artifacts/comet-constants.json` which Compound.js imports.
