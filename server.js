const config = require('config')
const express = require('express')
const redis = require('redis')
const cors = require('cors')
const app = express()

app.use(cors())

app.use(express.static('public'))

const client = redis.createClient(
  config.get('redis.port'),
  config.get('redis.host'),
  {
    'return_buffers': true
  }
).on('error', (err) => console.error('ERR:REDIS:', err));

function getPeers(cb) {
  client.get('peers', function (error, result) {
    if (error) {
      console.log('error')
      throw error;
    }

    const peers = JSON.parse(result)

    cb(peers)
  })
}

function getTransactions(cb) {
  client.get('transactions', function (error, result) {
    if (error) {
      console.log('error')
      throw error;
    }

    const transactions = JSON.parse(result)

    cb(transactions)
  })
}

client.on('connect', function() {
    console.log('redis client connected')

    const server = app.listen(config.get('server.port'), () => {
      const port = server.address().port
      console.log(`App listening on port ${port}`)
    })

})

app.get('/api', function (req, res) {
  getPeers((peers) => {
    getTransactions((transactions) => {
        const response = {
          peers: peers,
          transactions: transactions
        }
        res.send(response)
    })
  })
})

// 404
app.use((req, res) => {
  res.status(404).send('Not Found')
})

// health check
app.get('/health', function (req, res) {
  res.status(200).send
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send(err.response || 'Something broke!')
})


module.exports = app
