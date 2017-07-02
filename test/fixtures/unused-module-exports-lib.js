'use strict';

let fn;

module.exports = {
  answer: () => fn(),
  question: fn = () => 42,
  get getter() {},
  set setter(value) {}
};
