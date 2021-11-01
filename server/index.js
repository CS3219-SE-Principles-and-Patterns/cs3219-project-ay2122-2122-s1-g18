const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const constants = require('./src/constants')
const privateRoutes = require('./src/routes/privateRoutes')
const publicRoutes = require('./src/routes/publicRoutes')
const authController = require('./src/controllers/authController')
const socketController = require('./src/controllers/socketController')

dotenv.config()

const app = express()
const httpServer = require('http').createServer(app)

app.use((req, res, next) => {
  const corsWhitelist = process.env.NODE_ENV === 'production'
    ? constants.PRODUCTION_SERVER_URI
    : constants.DEV_CLIENT_URI

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

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
}

app.get('/', (req, res) => {
  res.json({
    status: 'healthy'
  })
})

app.use('/api', publicRoutes)
app.use('/api', authController.authenticateJwt, privateRoutes)

if (process.env.NODE_ENV === 'production') {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}

const port = process.env.PORT || 8000
httpServer.listen(port, () => {
  console.log('Running on port', port)
})

const io = require('socket.io')(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? constants.PRODUCTION_SERVER_URI
      : constants.DEV_CLIENT_URI,
    credentials: true
  }
})

io.on('connection', (socket) => {
  socketController.createEventListeners(socket, io)
})

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

module.exports = app
