#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const H = require('highland')
const turf = require('@turf/turf')

const minuteMs = 60 * 1000
const msThreshold = 60 * minuteMs // ten minutes

const minDistance = 5
const maxDistance = 75

function round (num, decimals = 2) {
  const m = 10 ** decimals
  return Math.round(num * m) / m
}

let sequenceId = 0
let lastPanorama

lineString = []
multiLineString = []

accMs = []
accDistance = []

// fs.createReadStream(argv._[0], 'utf8') : process.stdin

H(process.stdin)
  .split()
  .compact()
  .map(JSON.parse)
  .map((panorama) => {
    let sequence

    let diffMs
    let distance

    const date = new Date(panorama.data.timestamp)

    if (lastPanorama) {
      diffMs = date.getTime() - new Date(lastPanorama.data.timestamp).getTime()
      distance = round(turf.distance(panorama.geometry, lastPanorama.geometry, {
        units: 'meters'
      }))

      accMs.push(diffMs)
      accDistance.push(distance)
    }

    if (diffMs >= msThreshold && multiLineString.length) {
      // console.error('new sequence found', panorama.data.missionId === lastPanorama.data.missionId)
      // console.error(JSON.stringify(accMs), JSON.stringify(accDistance))
      sequenceGeometry = {
        type: 'MultiLineString',
        coordinates: [...multiLineString, [...lineString]]
      }

      multiLineString = []
      lineString = [panorama.geometry.coordinates]

      sequence = {
        sequenceId,
        timestamp: panorama.data.timestamp,
        // type: 'panorama-sequence',
        // data: {
        //   id: sequenceId
        // },
        geometry: sequenceGeometry
      }

      accMs = []
      accDistance = []

      sequenceId += 1
    }

    // Store images along sequence, just like Mapillary
    // does with coordinateProperties. See
    // https://www.mapillary.com/developer/api-documentation/#the-sequence
    // make this optional, and make two versions of data

    // https://github.com/mapbox/polyline
    // https://beta.observablehq.com/@jviide/monotone-cubic-interpolation

    if (distance >= minDistance && distance <= maxDistance) {
      lineString.push(panorama.geometry.coordinates)
    } else if (distance > maxDistance) {
      multiLineString = [...multiLineString, [...lineString]]
      lineString = [panorama.geometry.coordinates]
    }

    lastPanorama = panorama
    return sequence
  })
  .compact()
  .map(JSON.stringify)
  .intersperse('\n')
  .pipe(process.stdout)
