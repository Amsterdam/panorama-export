#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const H = require('highland')
const turf = require('@turf/turf')

if (!process.env['NODE_CONFIG_DIR']) {
  process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config')
}
const config = require('config')
const sequencesConfig = config.get('sequences')

const minDistance = sequencesConfig.minDistance
const maxDistance = sequencesConfig.maxDistance

function round (num, decimals = 2) {
  const m = 10 ** decimals
  return Math.round(num * m) / m
}

function sequenceFirst (sequence) {
  return sequence[0][0]
}

function sequenceLast (sequence) {
  const section = sequence[sequence.length - 1]
  return section[section.length - 1]
}

function sequenceProperty (sequence, getProperty) {
  return sequence.map((section) => section.map(getProperty))
}

let sequence = []
let sequenceSection = []

H(process.stdin)
  .split()
  .compact()
  .map(JSON.parse)
  .map((image) => {
    let feature
    let distance

    if (sequenceSection.length) {
      const lastImage = sequenceSection[sequenceSection.length - 1]

      distance = round(turf.distance(image.geometry, lastImage.geometry, {
        units: 'meters'
      }))

      if (image.properties.sequenceId !== lastImage.properties.sequenceId) {
        const filteredSequence = [...sequence, [...sequenceSection]]
          .filter((section) => section.length > 2)

        if  (filteredSequence.length) {
          const sequenceGeometry = {
            type: 'MultiLineString',
            coordinates: sequenceProperty(filteredSequence, (image) => image.geometry.coordinates)
          }

          feature = {
            type: 'Feature',
            id: sequenceFirst(filteredSequence).properties.sequenceId,
            properties: {
              type: 'image-sequence',
              tags: sequenceFirst(filteredSequence).properties.tags,
              capturedAt: [
                sequenceFirst(filteredSequence).properties.capturedAt,
                sequenceLast(filteredSequence).properties.capturedAt,
              ],
              coordinateProperties: {
                capturedAt: sequenceProperty(filteredSequence, (image) => image.properties.capturedAt),
                imageId: sequenceProperty(filteredSequence, (image) => image.id)
              }
            },
            geometry: sequenceGeometry
          }
        }

        sequenceSection = []
        sequence = []
      }
    }

    if (distance >= minDistance && distance <= maxDistance) {
      sequenceSection.push(image)
    } else if (distance > maxDistance) {
      sequence = [...sequence, [...sequenceSection]]
      sequenceSection = []
    }

    if (!sequenceSection.length) {
      sequenceSection = [image]
    }

    return feature
  })
  .compact()
  .map(JSON.stringify)
  .intersperse('\n')
  .pipe(process.stdout)
