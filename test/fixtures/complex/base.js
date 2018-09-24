'use strict';

const { stuff, moreStuff } = require('./loader');

exports.allStuff = `${stuff(2, 2)} ${moreStuff(2, 3)}`;
