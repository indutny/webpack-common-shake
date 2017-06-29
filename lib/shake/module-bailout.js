'use strict';

const WebpackError = require('webpack/lib/WebpackError');

class ModuleBailout extends WebpackError {
  constructor(module, bailout) {
    super();

    const loc = `${bailout.source || module.resource}:` +
        `${bailout.loc.start.line}:${bailout.loc.start.column}`;
    const reason = `${bailout.reason} at [${loc}]`;

    // NOTE: we can't push to `module.warnings` at this step, because
    // all modules are already built

    this.name = 'ShakeLocalBailout';
    this.message = `${module.resource} from webpack-common-shake\n${reason}`;

    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ModuleBailout;
