'use strict';

function Range(start, end) {
  this.start = start;
  this.end = end;

  this.children = [];
}
module.exports = Range;

Range.compare = (a, b) => {
  return b.start - a.start;
};

Range.prototype.contains = function contains(other) {
  return this.start <= other.start && other.end <= this.end;
};

Range.prototype.concat = function concat(child) {
  if (child.contains(this))
    return child.concat(this);

  // TODO(indutny): binary search
  for (let i = 0; i < this.children.length; i++) {
    const other = this.children[i];
    if (child.contains(other))
      this.children[i] = child.concat(other);
    else if (other.contains(child))
      this.children[i] = other.concat(child);
    else
      continue;
    return this;
  }

  this.children.push(child);
  return this;
};

Range.prototype.compute = function compute(parent) {
  for (let i = 0; i < this.children.length; i++)
    this.children[i].compute(this);

  if (parent) {
    this.start -= parent.start;
    this.end -= parent.start;
  }
  this.children.sort(Range.compare);
};

Range.prototype.replace = function replace(source) {
  const before = source.slice(0, this.start);
  let chunk = source.slice(this.start, this.end);
  const after = source.slice(this.end);

  for (let i = 0; i < this.children.length; i++)
    chunk = this.children[i].replace(chunk);

  chunk = this.getReplacement(chunk);
  return before + chunk + after;
};

// To be overridden:

Range.prototype.getReplacement = function getReplacement(source) {
  return source;
};
