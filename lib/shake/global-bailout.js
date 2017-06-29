'use strict';

const WebpackError = require('webpack/lib/WebpackError');

class GlobalBailout extends WebpackError {
  constructor(bailout) {
    super();

    const loc = `${bailout.source}:` +
        `${bailout.loc.start.line}:${bailout.loc.start.column}`;
    const reason = `${bailout.reason} at [${loc}]`;

    this.name = 'ShakeGlobalBailout';
    this.message = `global bailout from webpack-common-shake\n${reason}`;
    this.warning = reason;
    this.details = undefined;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = GlobalBailout;
