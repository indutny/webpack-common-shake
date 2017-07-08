# CommonJS Tree Shaker plugin for Webpack
[![NPM version](https://badge.fury.io/js/webpack-common-shake.svg)](http://badge.fury.io/js/webpack-common-shake)
[![Build Status](https://secure.travis-ci.org/indutny/webpack-common-shake.svg)](http://travis-ci.org/indutny/webpack-common-shake)

![Fancy shaking logo](https://github.com/indutny/webpack-common-shake/blob/master/logo/shake.gif)

Please file an [issue][0] if anything is broken.

See [common-shake][1] for abstract bundler-independent implementation.

_NOTE: [webpack][2] version 3 may be needed in order to run this._

_NOTE: Logo is a modified version of [webpack's logo][5]_

## Why?

There are vast amount of CommonJS modules out there. Thus CommonJS Tree Shaking
is as important as the ESM module import/export shaking.

## How?

This plugin removes unused assignments to `exports` properties leaving removal
of the (presumably) dead code to UglifyJS. If, for example, you had a module:

```js
exports.used = 1;
var tmp = exports.unused = 2;
```

This plugin will transform it to:

```js
exports.used = 1;
var tmp = 2;
```

It is up to UglifyJS (or some other optimizer) to decide, whether `tmp` is used
or not and delete it. Luckily it is much simpler for it to do if the uses are
not clouded by exporting the values.

## Usage

Example `webpack.config.js`:
```js
const ShakePlugin = require('webpack-common-shake').Plugin;

module.exports = [{
  entry: 'entry.js'
  output: {
    path: 'dist',
    filename: 'output.js'
  },
  plugins: [ new ShakePlugin() ]
}];
```

## Demonstration

See [webpack-common-shake-demo][4] for size comparison of output with and
without this plugin.

## Options

Plugin constructor accepts `options` object which may have following properties:

```js
const plugin = new ShakePlugin({
  warnings: {
    global: true,
    module: false
  } /* default */,

  // Invoked on every deleted unused property
  onExportDelete: (resource, property) => {},

  // See `Limitations` section for description
  onModuleBailout: (module, bailouts) => { ... },
  onGlobalBailout: (bailouts) => { ... }
});
```

## Limitations

Although, generally this module works and helps removing unused code from the
bundles. There are some limitations that may prevent it from running either
partially or completely. Some examples are provided below, otherwise please use
common sense (or `onModuleBailout`, `onGlobalBailout` plugin options).

Some local (partial) bailouts:

* Dynamic exports `exports[Math.random()] = ...`
* Overriding imported vars `var a = require('./a'); a.lib; a = require('./b')`
* Using `require` in unknown way `console.log(require('./lib'))`
* Destructuring `require` dynamically `{ [prop]: name } = require('./a')`
* Dynamic import `var fn = require('./lib')[Math.random()]`

Some global (full) bailouts:

* Dynamic use of require `require(Math.random())`

This plugin will print some webpack warnings. In any case, bailouts may be
obtained programmatically too:

```js
const plugin = new ShakePlugin({
  onModuleBailout: (module, bailouts) => { ... },
  onGlobalBailout: (bailouts) => { ... }
});
```

## Graph

For debugging and inspection purposes a graph in [dot][3] format may be
obtained using `onGraph` option:

```js
const plugin = new ShakePlugin({
  onGraph: (graph) => { ... }
});
```

## LICENSE

This software is licensed under the MIT License.

Copyright Fedor Indutny, 2017.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://github.com/indutny/webpack-common-shake/issues
[1]: https://github.com/indutny/common-shake
[2]: https://webpack.github.io/
[3]: http://www.graphviz.org/content/dot-language
[4]: https://github.com/indutny/webpack-common-shake-demo
[5]: https://github.com/webpack/media/issues/12
