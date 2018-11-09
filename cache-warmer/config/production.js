const config = {
  redis: {
    port: process.env.REDISPORT || 6379,
    host: process.env.REDISHOST
  }
}

module.exports = config
