'use strict';

function t() {
}

// Look, no semicolons!
t()
exports.binary = (
  exports.a = (exports.b = 3, exports.c = 4),
  exports.d = (exports.e = 3, exports.f = 4)
);

exports.preanswer = exports.answer = exports.postanswer = 42;
exports.question = () => { throw new Error(); }
