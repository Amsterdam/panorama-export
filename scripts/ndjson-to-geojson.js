#!/usr/bin/env node

const H = require('highland')

const features = H(process.stdin)
  .split()
  .compact()
  .intersperse(',\n')

H([
  H(['{"type":"FeatureCollection","features":[']),
  features,
  H([']}\n'])
]).sequence()
  .pipe(process.stdout)