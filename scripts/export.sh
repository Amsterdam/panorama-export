#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export NODE_CONFIG_DIR=$DIR/config

# Generate images and sequences NDJSON files
cp /mnt/test-data/images.ndjson /mnt/output/images.ndjson
# ./postgres-to-ndjson.js > /mnt/output/images.ndjson
cat /mnt/output/images.ndjson | ./ndjson-to-sequences.js > /mnt/output/sequences.ndjson

# Generate output formats for images

ndjson-to-csv -f '["$.data.missionId","$.data.timestamp","$.data.filename","$.data.path","$.data.tags"]' /mnt/output/images.ndjson > /mnt/output/images.csv
# TODO: also create flattened GeoJSON for GeoPackage en Shapefile!
ndjson-to-geojson /mnt/output/images.ndjson > /mnt/output/images.geojson

ogr2ogr -nlt POINT -skipfailures /mnt/output/images.shp /mnt/output/images.geojson
ogr2ogr -f GPKG /mnt/output/images.gpkg /mnt/output/images.geojson

tippecanoe --force -zg -o /mnt/output/images.mbtiles \
  --drop-densest-as-needed --extend-zooms-if-still-dropping /mnt/output/images.geojson

# Generate output formats for sequences

ndjson-to-csv -f '[]' /mnt/output/sequences.ndjson > /mnt/output/sequences.csv
# TODO: also create flattened GeoJSON for GeoPackage en Shapefile!
ndjson-to-geojson /mnt/output/sequences.ndjson > /mnt/output/sequences.geojson

ogr2ogr -nlt LINESTRING -skipfailures /mnt/output/sequences.shp /mnt/output/sequences.geojson
ogr2ogr -f GPKG /mnt/output/sequences.gpkg /mnt/output/sequences.geojson

tippecanoe --force -zg -o /mnt/output/sequences.mbtiles \
  --drop-densest-as-needed --extend-zooms-if-still-dropping /mnt/output/sequences.geojson
