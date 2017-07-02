'use strict';

module.exports = {
  answer: 42,
  question: () => { throw new Error(); },
  get getter() {},
  set setter(value) {}
};
