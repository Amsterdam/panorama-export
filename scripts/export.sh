#!/bin/bash

# ./postgres-to-ndjson.js > /mnt/data/images.ndjson
cp /mnt/test-data/images.ndjson /mnt/output/images.ndjson
cat /mnt/output/images.ndjson | ./ndjson-to-sequences.js > /mnt/output/sequences.ndjson
# ./sequences.js /mnt/output/images.ndjson

# TODO: fix -f '[]'
ndjson-to-csv -f '[]' /mnt/output/images.ndjson > /mnt/output/images.csv
# TODO: also create flattened GeoJSON for GeoPackage en Shapefile!
ndjson-to-geojson /mnt/output/images.ndjson > /mnt/output/images.geojson

ogr2ogr -nlt POINT -skipfailures /mnt/output/images.shp /mnt/output/images.geojson
ogr2ogr -f GPKG /mnt/output/images.gpkg /mnt/output/images.geojson

tippecanoe --force -zg -o /mnt/output/images.mbtiles \
  --drop-densest-as-needed --extend-zooms-if-still-dropping /mnt/output/images.geojson

ndjson-to-csv -f '[]' /mnt/output/sequences.ndjson > /mnt/output/sequences.csv
# TODO: also create flattened GeoJSON for GeoPackage en Shapefile!
ndjson-to-geojson /mnt/output/sequences.ndjson > /mnt/output/sequences.geojson

ogr2ogr -nlt LINESTRING -skipfailures /mnt/output/sequences.shp /mnt/output/sequences.geojson
ogr2ogr -f GPKG /mnt/output/sequences.gpkg /mnt/output/sequences.geojson

tippecanoe --force -zg -o /mnt/output/sequences.mbtiles \
  --drop-densest-as-needed --extend-zooms-if-still-dropping /mnt/output/sequences.geojson
