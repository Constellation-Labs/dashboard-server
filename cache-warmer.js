const redis = require('redis')
const config = require('config')
const express = require('express')
const request = require('request')
const _ = require('lodash')
const app = express()

const client = redis.createClient(
  config.get('redis.port'),
  config.get('redis.host'),
  {
    'return_buffers': true
  }
).on('error', (err) => console.error('ERR:REDIS:', err));

var peers = []
var transactions = []

client.on('connect', function() {
  console.log('redis client connected')

  const server = app.listen(config.get('cacheServer.port'), () => {
    const port = server.address().port
    console.log(`App listening on port ${port}`)
  })

    client.get('peers', function (error, result) {
      if (error) {
        console.log('error')
        throw error;
      }

      console.log('stored peers = ', JSON.parse(result))
    })

    client.get('transactions', function (error, result) {
      if (error) {
        console.log('error')
        throw error;
      }

      console.log('stored transactions = ', JSON.parse(result))
    })

    function updateCache() {
      request('http://testnet.dag.works:9000/dashboard', { json: true }, (err, res, body) => {
        if (err) { return console.log(err); }

        const peers = _.get(body, 'peers', [])
        const transactions = _.get(body, 'transactions', [])

        if (_.size(peers) > 0) {
          // TODO: lookup ipstack geolocations and parse ip addresses from peers
            client.set('peers', JSON.stringify(peers), redis.print)
        }

        if (_.size(transactions) > 0) {
            client.set('transactions', JSON.stringify(transactions), redis.print)
        }

        console.log('peers = ', peers)
        console.log('transactions = ', transactions)
      });
    }

    // TODO: wrap in loop
    updateCache()
})

app.post('/reset', function (req, res) {
  client.set('peers', JSON.stringify([]), redis.print)
  client.set('transactions', JSON.stringify([]), redis.print)

  res.status(200).send
})

app.get('/health', function (req, res) {
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
