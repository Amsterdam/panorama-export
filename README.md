# panorama-export

Dockerfile and scripts to export the panorama database to GeoJSON, vector tiles and other file formats.

For a visulization of the resulting data, see [amsterdam.github.io/panorama-visualization](https://amsterdam.github.io/panorama-visualization). The source code of this visualization is also [available on GitHub](https://github.com/Amsterdam/panorama-visualization).

First, build the Docker image:

    docker-compose build export

If you want, you can run bash in the container like this:

    docker-compose exec export bash

## Exporting Data

To export data from the database, run

    ./scripts/export.sh

To change the database connection settings, you can edit the [configuration file](scripts/config/default.js).
