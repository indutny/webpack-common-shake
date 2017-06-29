import { answer } from './require-esm-esm';

export let esmAnswer = answer;
export let commonAnswer = require('./require-esm-common').answer;
export let commonjs = 'rocks';
