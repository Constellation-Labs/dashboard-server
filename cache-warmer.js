const redis = require('redis')
const config = require('config')
const express = require('express')
const app = express()

const client = redis.createClient(
  config.get('redis.port') || '6379',
  config.get('redis.host') || '127.0.0.1',
  {
    'return_buffers': true
  }
).on('error', (err) => console.error('ERR:REDIS:', err));

// TODO:
// on a schedule hit the testnet.dag.works/dashboard endpoint
// check if there are any new transactions
// if so call ipstack and map the geolocations
// store in redis

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

const server = app.listen(config.get('server.port'), () => {
  const port = server.address().port
  console.log(`App listening on port ${port}`)
})
