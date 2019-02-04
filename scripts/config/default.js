module.exports = {
  database: {
    user: 'panorama',
    host: 'localhost',
    database: 'panorama',
    password: 'insecure',
    port: 5454
  },
  sequences: {
    msThreshold: 60 * 60 * 1000, // ten minutes
    minDistance: 5,
    maxDistance: 75
  }
}
