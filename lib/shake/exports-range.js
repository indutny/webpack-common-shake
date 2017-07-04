'use strict';

const util = require('util');

const root = require('../shake');
const Range = root.Range;

function ExportsRange(node, isStatement) {
  Range.call(this, node.start, node.end);
  this.isStatement = isStatement;
  this.right = {
    start: node.right.start - this.start,
    end: node.right.end - this.end
  };
}
util.inherits(ExportsRange, Range);
module.exports = ExportsRange;

// TODO(indutny): this works only because `ExportsRange` is always nested in
// `ExportsRange`. Make it work in general!
ExportsRange.prototype.getReplacement = function getReplacement(original) {
  const replacement = original.slice(this.right.start,
                                     original.length + this.right.end);

  if (this.isStatement)
    return `;(${replacement})`;
  return `(${replacement})`;
};
