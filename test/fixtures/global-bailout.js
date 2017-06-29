'use strict';

const random = process.env['cshake-' + Math.random()];

const lib = require('./global-bailout-' + (random || 'lib'));

exports.answer = lib.answer;
