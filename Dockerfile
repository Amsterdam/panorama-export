FROM amsterdam/python
MAINTAINER datapunt@amsterdam.nl

RUN apt-get update && apt-get install -my wget gnupg -y
RUN apt install build-essential -y

# Setup build env
RUN mkdir /build

# Install Node.js
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
RUN apt-get install -y nodejs npm

# Install Tippecanoe
RUN cd /build && \
  git clone https://github.com/mapbox/tippecanoe.git && \
  cd tippecanoe && \
  make -j && \
  make install

WORKDIR /mnt/scripts
