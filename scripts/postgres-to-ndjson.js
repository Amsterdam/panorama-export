#!/usr/bin/env node

const path = require('path')
const H = require('highland')
const { Client } = require('pg')
const QueryStream = require('pg-query-stream')

if (!process.env['NODE_CONFIG_DIR']) {
  process.env['NODE_CONFIG_DIR'] = path.join(__dirname, 'config')
}
const config = require('config')
const databaseConfig = config.get('database')

const client = new Client(databaseConfig)

const sql = `
  SELECT
    p.*, m.name AS mission_id, m.date AS mission_date,
    ST_AsGeoJSON(_geolocation_2d) AS geojson
  FROM panoramas_panorama p
  JOIN panoramas_mission m
  ON substring(p.pano_id from 0 for 21) = m.name
  ORDER BY timestamp;
`

async function run () {
  await client.connect()

  const query = new QueryStream(sql)
  const stream = client.query(query)

  const panoramas = H(stream)
    .map((row) => ({
      id: row.pano_id,
      type: 'panorama',
      data: {
        missionId: row.mission_id,
        timestamp: row.timestamp,
        filename: row.filename,
        path: row.path,
        tags: row.tags
      },
      geometry: JSON.parse(row.geojson)
    }))
    .map(JSON.stringify)
    .intersperse('\n')
    .on('end', () => {
      client.end()
    })

  panoramas
    .pipe(process.stdout)
}

run()
