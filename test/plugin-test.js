'use strict';

const assert = require('assert');
const path = require('path');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');

const run = require('vm').runInNewContext;

const CommonShakePlugin = require('../').Plugin;

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const TMP_DIR = path.join(__dirname, 'tmp');

describe('webpack-common-shake', () => {
  function compile(file, callback) {
    const fs = new MemoryFS();
    const removed = [];

    const compiler = webpack({
      cache: false,
      bail: true,
      entry: path.join(FIXTURES_DIR, file),
      output: {
        path: TMP_DIR,
        filename: 'out.js'
      },
      plugins: [
        new CommonShakePlugin({
          onExportDelete: (resource, name) => removed.push({ resource, name })
        })
      ]
    }, (err) => {
      if (err)
        return callback(err);

      const out = fs.readFileSync(path.join(TMP_DIR, 'out.js')).toString();
      callback(null, run(out.toString()), removed);
    });
    compiler.outputFileSystem = fs;
    return compiler;
  }

  it('should compile `root.js`', (cb) => {
    compile('root.js', (err, file) => {
      assert.ok(!err);
      assert.deepEqual(file, { out: 1 });
      cb();
    });
  });

  it('should remove unused exports of `unused-exports.js`', (cb) => {
    compile('unused-exports.js', (err, file, removed) => {
      assert.ok(!err);
      assert.deepEqual(file, { answer: 42 });
      assert.deepEqual(removed, [{
        name: 'question',
        resource: path.join(FIXTURES_DIR, 'unused-exports-lib.js')
      }]);
      cb();
    });
  });

  it('should require ESM module`', (cb) => {
    compile('require-esm.js', (err, file, removed) => {
      assert.ok(!err);
      assert.deepEqual(file, { commonjs: 'rocks' });
      assert.deepEqual(removed, []);
      cb();
    });
  });
});
