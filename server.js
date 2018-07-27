const config = require('config')
const express = require('express')
const app = express()

app.get('/dashboard', function (req, res) {
  // TODO:
  // lookup from redis transactions
  res.send('hello world')
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

const server = app.listen(config.get('server.port'), () => {
  const port = server.address().port
  console.log(`App listening on port ${port}`)
})

module.exports = app
