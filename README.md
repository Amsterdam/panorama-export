# panorama-export

Dockerfile and scripts to export the panorama database to CSV, GeoJSON, Shapefile and other file formats.

First, build the Docker image:

    docker-compose build export

If you want, you can run bash in the container like this:

    docker-compose exec export bash

## Exporting Data

To export data from the database, run

    ./scripts/export.sh

_Note: `export.sh` only works from inside the Docker container!_

To change the database connection settings, you can edit the [configuration file](scripts/config/default.js).
