#!/usr/bin/env node

const H = require('highland')
const { Client } = require('pg')
const QueryStream = require('pg-query-stream')

const client = new Client({
  user: 'panorama',
  host: 'localhost',
  database: 'panorama',
  password: 'insecure',
  port: 5454
})

// TODO: use new data model, with tags etc.
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
        distance: row.mission_distance,
        tags: [
          row.mission_type,
          row.surface_type === 'L' ? 'land' : 'water',
          row.mission_year
        ]
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
