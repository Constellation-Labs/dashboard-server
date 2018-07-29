const config = {
    log: {
      level: 'DEBUG'
    },
    server: {
      port: 8080
    },
    cacheServer: {
      port: 9090,
      successUpdateInterval: 5000,
      errorUpdateInterval: 450000
    },
    redis: {
      port: 6379,
      host: "127.0.0.1"
    },
    cluster: {
      url: 'http://testnet.dag.works:9000/dashboard'
    },
    ipstack: {
      url: 'http://api.ipstack.com',
      accessKey: '4cbeb35d4c9292caa246e66c1ebe79a3'
    }
}

module.exports = config
