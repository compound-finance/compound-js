// Rollup builds only the browser version using the Node.js build.
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import minify from 'rollup-plugin-babel-minify';
import pkg from './package.json';

export default [{
  input: './dist/nodejs/index.js',
  onwarn: (message) => {
    if (message.code === 'MISSING_NODE_BUILTINS') return;
  },
  output: {
    name: 'Compound',
    file: pkg.browser,
    format: 'iife',
    sourcemap: false,
    globals: {
      'http': '{}',
      'https': '{}',
    },
  },
  plugins: [
    resolve({
      preferBuiltins: true,
      browser: true
    }),
    commonjs(),
    minify({ comments: false }),
  ],
  external: [
    'http',
    'https',
  ]
}];
