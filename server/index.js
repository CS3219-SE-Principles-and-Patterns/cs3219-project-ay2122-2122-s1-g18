const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const constants = require('./src/constants')
const routes = require('./src/routes')
const socketController = require('./src/controllers/socketController')

dotenv.config()

const app = express()
const httpServer = require('http').createServer(app)

app.use((req, res, next) => {
  const corsWhitelist = process.env.NODE_ENV === 'production'
    ? [constants.PRODUCTION_SERVER_URI, constants.PRODUCTION_CLIENT_URI]
    : [constants.DEV_CLIENT_URI, constants.DEV_SOCKET_URI]
  // console.log(req.headers.origin)
  // console.log(corsWhitelist.indexOf(req.headers.origin))
  if (corsWhitelist.indexOf(req.headers.origin) !== -1) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization')
  }

  next()
})
app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  res.json({
    status: 'healthy'
  })
})

// const serveStatic = require('serve-static')
// const path = require('path')
// app.use(serveStatic(path.join(__dirname, 'dist')))

const port = process.env.PORT || 8000
app.listen(port, () => {
  console.log('Running on port', port)
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.use('/api', routes)

// socket IO
// httpServer.listen(4000)

// const socketOptions = {
//   path: '/socket.io',
//   pingInterval: 10 * 1000,
//   pingTimeout: 5000,
//   transports: ['websocket']
// }

const io = require('socket.io')(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? [constants.PRODUCTION_SERVER_URI, constants.PRODUCTION_CLIENT_URI]
      : constants.DEV_CLIENT_URI,
    credentials: true
  }
})

console.log(io)

io.on('connection', (socket) => {
  console.log('Server socket', socket, 'created')
  socketController.createEventListeners(socket, io)
})

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

module.exports = app
