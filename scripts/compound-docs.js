const fs = require('fs');
const docblockParser = require('docblock-parser');

String.prototype.toSingleLine = function () {
  return this.replace(/\n    /g, ' ');
}

// Credit https://stackoverflow.com/a/7225450/6193736
String.prototype.toTitleCase = function () {
  const result = this.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

String.prototype.toKebabCase = function () {
  const title = this.toTitleCase();
  return title.replace(/\s/g, '-').toLowerCase();
}

// remove trailing slash due to docblock-parser bug
function unSlashBug(parsed) {
  const tags = parsed.tags;

  if (!tags) {
    return parsed;
  }

  let keys = Object.keys(parsed.tags);

  let str = parsed.tags[keys[keys.length-1]];

  if (str[str.length-2] === '\n' && str[str.length-1] === '\/') {
    str = str.slice(0, str.length-2);
  }

  parsed.tags[keys[keys.length-1]] = str;

  return parsed;
}

function reduceParamString(param) {
  param = param.toSingleLine();
  const docBlockItems = (/({.+}) ([^\ ])+ /g).exec(param);

  const toRemove = docBlockItems[0];
  let name = docBlockItems[0].split(' ');
  name = name[name.length-2];
  let type = docBlockItems[1];
  type = '(' + type.slice(1, type.length-1) + ')';

  param = `- \`${name}\` ${type} ${param.split(toRemove)[1]}`;

  // HTML escape < and >
  param = param.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');

  return param;
}

function markdownify(block, functionName) {
  let result = '';
  const tags = block.tags;

  // don't render doc blocks marked hidden
  if (tags.hidden !== undefined) {
    return result;
  }

  // for the header of a file
  if (tags.file && tags.desc) {
    const file = `${tags.file} Methods`;
    result += `## ${file}\n\n`;
    result += `${tags.desc.toSingleLine()}\n\n`;

    return result;
  }

  const isApi = tags.example && tags.example.includes('\.api\.');
  const isV2 = !(tags.example && tags.example.includes('\.comet\.'));
  let title = functionName.toTitleCase();

  // handle special cases
  if (isApi) {
    title += ' API'
  }

  if (functionName === 'cToken' && isV2) {
    title = 'cToken API';
  }

  if (functionName === 'supply') {
    title = isV2 ? 'Compound v2 Supply' : 'Compound III Supply';
  }

  if (functionName === 'getPrice') {
    title = isV2 ? 'Compound v2 Get Price' : 'Compound III Get Price';
  }

  if (functionName === 'function') {
    title = 'Compound Constructor';
  }

  if (title === 'Get Abi') {
    title = 'Get ABI';
  }

  if (title === 'Get Net Name With Chain Id') {
    title = 'Get Network Name With Chain ID';
  }

  // create section header
  result += `## ${title}\n\n`;

  // description
  const description = block.text.toSingleLine();
  result += description + '\n\n';

  // parameters
  if (tags.param) {
    tags.param = Array.isArray(tags.param) ? tags.param : [ tags.param ];

    tags.param.forEach((param) => {
      result += reduceParamString(param) + '\n';
    });
  }

  // return
  if (tags.returns) {
    let _return = tags.returns.toSingleLine().replace('{', '(').replace('}', ')');
    _return = _return.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    result += '- `RETURN` ' + _return + '\n';
  }

  // example
  if (tags.example) {
    const example = tags.example
      .replace('```', "```js")
      .replace(/&/g, '&amp;');
    result += example + '\n\n';
  }

  // escape pipe characters (doc block parameter type definitions)
  // might become an issue if we add md tables to the docs
  result = result.replace(/\|/g, '\\|');

  return result;
}

function getDocBlocks(fileContents) {
  const docBlocks = [];
  const startVal = '/**';
  const endVal = ' */';

  const lines = fileContents.toString().split('\n');

  let startIndex;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === startVal) {
      startIndex = i;
    }

    if (line === endVal) {
      const functionNameLine = lines[i+1];
      const rgx = /\ ([^\s]+)\(/g;

      const functionNameResult = rgx.exec(functionNameLine);

      let functionName;
      if (functionNameResult !== null) {
        functionName = functionNameResult[1];
      }

      let contents = '';
      for (let j = startIndex; j <= i; j++) {
        const _line = lines[j];
        contents += _line + '\n';
      }

      docBlocks.push({
        functionName,
        contents
      });
    }

  }

  return docBlocks;
}

function getAllFilePaths(srcPath, resultPaths) {
  dirOrFileNames = fs.readdirSync(srcPath);

  resultPaths = resultPaths || [];

  dirOrFileNames.forEach((name) => {
    if (fs.statSync(srcPath + name).isDirectory()) {
      resultPaths = getAllFilePaths(srcPath + name + '/', resultPaths);
    } else {
      resultPaths.push(srcPath + name);
    }
  });

  return resultPaths;
}

let intro = `
# Compound.js

## Introduction

[Compound.js](https://www.npmjs.com/package/@compound-finance/compound-js) is ` +
`a JavaScript SDK for Ethereum and the Compound Protocol. It wraps ` +
`around Ethers.js, which is its only dependency. It is designed for ` +
`both the web browser and Node.js.

The SDK is currently in open beta. **Use at your own risk.**

For bugs reports and feature requests, either create an issue in ` +
`the [GitHub repository](https://github.com/compound-finance/compound-js) ` +
`or send a message in the Development channel of the ` +
`[Compound Discord](https://compound.finance/discord).\n\n`;

const srcDir = './src/';
const outFilePath = './scripts/out.md';

const srcFilePaths = getAllFilePaths(srcDir);

// Move `index.ts` to the front
const indexTs = './src/index.ts';
const idx = srcFilePaths.findIndex((el) => el === indexTs);
srcFilePaths.splice(idx, 1);
srcFilePaths.unshift(indexTs);

let mdResult = '';
mdResult += intro;

srcFilePaths.forEach((f) => {
  const fileContents = fs.readFileSync(f);
  const blocks = getDocBlocks(fileContents);

  if (blocks.length > 0) {
    blocks.forEach((b) => {
      let parsed = unSlashBug(docblockParser.parse(b.contents));
      mdResult += markdownify(parsed, b.functionName);
    });
  }
});

fs.writeFileSync(outFilePath, mdResult);
