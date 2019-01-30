FROM ubuntu:18.04
MAINTAINER datapunt@amsterdam.nl

RUN apt-get update && apt-get install -my wget gnupg -y
RUN apt install build-essential -y

# Setup build env
RUN mkdir /build
RUN apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 16126D3A3E5C1192    \
  && apt-get update && apt-get install -y --fix-missing --no-install-recommends software-properties-common \
  && add-apt-repository ppa:ubuntugis/ubuntugis-unstable -y    \
  && apt-get update && apt-get install -y --fix-missing --no-install-recommends gcc-4.8 g++-4.8 build-essential ca-certificates curl wget git libaio1 make cmake python-dev \
      software-properties-common  libc6-dev openssh-client libpng16-16 libjpeg-dev libgif-dev liblzma-dev libgeos-dev \
      libproj-dev libxml2-dev libexpat-dev libxerces-c-dev libnetcdf-dev netcdf-bin libpoppler-dev libspatialite-dev swig  \
      libhdf5-serial-dev libpodofo-dev poppler-utils libfreexl-dev libwebp-dev libepsilon-dev libpcre3-dev gfortran libarpack2-dev \
      libpq-dev libflann-dev libhdf5-serial-dev libhdf5-dev libjsoncpp-dev clang-3.9  libhdf4-alt-dev libsqlite3-dev    \
      libltdl-dev libcurl4-openssl-dev ninja-build cython python-pip libpng-dev  \
      libprotobuf-c-dev libprotobuf-c1 protobuf-c-compiler protobuf-compiler \
      libboost-filesystem1.65-dev libboost-iostreams1.65-dev libboost-system1.65-dev libboost-thread1.65-dev libogdi3.2-dev time

RUN update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-4.8 20 && update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-4.8 20
#RUN CXX=clang++ && CC=clang
RUN apt-get install -y gdal-bin libgdal-dev gdal-data libgdal20
RUN apt-get install -y apache2 apache2-utils libmapcache1 libapache2-mod-mapcache cgi-mapserver \
      mapserver-bin libmapserver-dev

# Install Node.js
RUN apt-get install -y nodejs npm

# Install Tippecanoe
RUN cd /build && \
  git clone https://github.com/mapbox/tippecanoe.git && \
  cd tippecanoe && \
  make -j && \
  make install

# Install ndjson-cli
RUN npm install -g bertspaan/ndjson-cli

WORKDIR /mnt/scripts
