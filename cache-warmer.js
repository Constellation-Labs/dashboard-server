const redis = require('redis')
const config = require('config')
const express = require('express')
const request = require('request')
const _ = require('lodash')
const app = express()

let shouldLoopCacheUpdate = false
let redisConnected = false
let cacheUpdateLoopCount = 0

const client = redis.createClient(
  config.get('redis.port'),
  config.get('redis.host'),
  {
    'return_buffers': true
  }
).on('error', (err) => {
  console.error('ERR:REDIS:', err)
  redisConnected = false
});

client.on('connect', function() {
  console.log('redis client connected')

  const server = app.listen(config.get('cacheServer.port'), () => {
    const port = server.address().port
    console.log(`App listening on port ${port}`)
  })

  redisConnected = true
})

function loopCacheUpdate() {
  if (shouldLoopCacheUpdate && redisConnected) {
    cacheUpdateLoopCount += 1

    console.log('cache update loop count = ', cacheUpdateLoopCount)

    updateCache().then(() => {
      console.log('cache has updated successfully')
      if (shouldLoopCacheUpdate) {
        setTimeout(() => {
          loopCacheUpdate()
        }, config.get('cacheServer.successUpdateInterval'))
      }
    }).catch((err) => {
      console.log('error updating cache = ', err)

      if (shouldLoopCacheUpdate) {
        setTimeout(() => {
          loopCacheUpdate()
        }, config.get('cacheServer.errorUpdateInterval'))
      }
    })
  }
}

function startCacheUpdateLoop() {
  if (!shouldLoopCacheUpdate) {
    shouldLoopCacheUpdate = true
    loopCacheUpdate()
  }
}

function stopCacheUpdateLoop() {
  shouldLoopCacheUpdate = false
}

function getGeolocationData(ip) {
  let promise = new Promise((resolve, reject) => {

    // try to lookup from redis if we have already cached this geolocation
    client.get('ip:' + ip, function (error, result) {
      if (error) {
        console.log('ip cache lookup error = ', error)
        reject(error)
      }

      const cachedGeolocation = JSON.parse(result)

      if (cachedGeolocation) {
        console.log('geolocation data cached hit = ', cachedGeolocation)
        resolve(cachedGeolocation)
      } else {
        // If we have not already cached this then ask ipstack
        const requestUrl = config.get('ipstack.url') + '/' + ip
          + '?access_key=' + config.get('ipstack.accessKey')

        console.log('request url = ', requestUrl)

        request(requestUrl, { json: true }, (err, res, body) => {
          if (err) {
            console.log('ip stack request error = ', err)
            reject(err)
          }

          const ipGeolocationData = JSON.stringify(body)

          console.log('ip geolocation data = ', ipGeolocationData)

          client.set('ip:' + ip, ipGeolocationData, redis.print)

          resolve(body)
        })
      }
    })
  })

  return promise
}

function updateCache() {
  const cachePromise = new Promise((resolve, reject) => {
    request(config.get('cluster.url'), { json: true }, (err, res, body) => {
      if (err) {
        console.log('error calling cluster = ', err)
        return reject(err)
      }

      const peerPromises = _.get(body, 'peers', []).map(p => {
        const peerPromise = new Promise((resolve, reject) => {

          // extract ip from kube specific hosts
          const ipAddress = p.host.split('.bc.googleusercontent.com')[0]

          if (ipAddress === '') {
            console.log('ip address is missing for peer = ', p)
            return resolve({})
          }

          const geolocation = getGeolocationData(ipAddress)

          geolocation.then((gld) => {
            let nodeData = {
              address: p.address,
              host: ipAddress,
              port: p.port,
              geolocationData: gld
            }

            resolve(nodeData)
          }).catch((error) => {
            reject(error)
          })
        })

        return peerPromise
      })

      Promise.all(peerPromises).then((peers) => {
        const filteredPeers = peers.filter(f => _.has(f, 'geolocationData'))

        console.log('filtered peers = ', filteredPeers)

        if (_.size(filteredPeers) > 0) {
            client.set('peers', JSON.stringify(filteredPeers), redis.print)
        }

        const transactions = _.get(body, 'transactions', [])

        if (_.size(transactions) > 0) {
          client.set('transactions', JSON.stringify(transactions), redis.print)
        }

        resolve()
      }).catch((error) => {
        console.log('peer promises fetching error = ', error)
        reject(error)
      })
    });
  })

  return cachePromise
}

app.post('/flushdb', (req, res) => {
  console.log('flushing db')
  client.flushdb()
  res.status(200).send
})

app.post('/updateCache', (req, res) => {
  console.log('updating cache')
  updateCache()
  res.status(200).send
})

app.post('/start', (req, res) => {
  console.log('start cache update loop called')
  startCacheUpdateLoop()
  res.status(200).send
})

app.post('/stop', (req, res) => {
  console.log('stop cache update loop called')
  stopCacheUpdateLoop()
  res.status(200).send
})

app.get('/health', (req, res) => {
  res.status(200).send
})

// 404
app.use((req, res) => {
  res.status(404).send('Not Found')
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send(err.response || 'Something broke!')
})
