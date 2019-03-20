#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
export NODE_CONFIG_DIR=$DIR/config

# Generate images and sequences NDJSON files
./export-features-ndjson.js > ../output/images.ndjson
./ndjson-to-sequences.js < ../output/images.ndjson > ../output/sequences.ndjson

./ndjson-to-geojson.js < ../output/sequences.ndjson > ../output/sequences.geojson

# ogr2ogr -nlt POINT -skipfailures ../output/images.shp ../output/images.geojson
# ogr2ogr -f GPKG ../output/images.gpkg ../output/images.geojson

tippecanoe --force -z14 -o ../output/sequences.mbtiles \
  --exclude=coordinateProperties \
   ../output/sequences.geojson
