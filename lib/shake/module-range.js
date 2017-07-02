'use strict';

const assert = require('assert');
const util = require('util');

const root = require('../shake');
const Range = root.Range;

function ModuleRange(node) {
  Range.call(this, node.start, node.end);

  this.kind = node.kind;
  this.key = JSON.stringify(node.key.name || node.key.value);
  this.value = {
    start: node.value.start - this.start,
    end: node.value.end - this.end
  };
}
util.inherits(ModuleRange, Range);
module.exports = ModuleRange;

// TODO(indutny): this works only because `ModuleRange` has no children
ModuleRange.prototype.getReplacement = function getReplacement(original) {
  assert.equal(this.children.length, 0);
  if (this.kind !== 'init')
    return `${this.key}: null`;

  const value = original.slice(this.value.start,
                               original.length + this.value.end);
  return `${this.key}: ((${value}),null)`;
};
