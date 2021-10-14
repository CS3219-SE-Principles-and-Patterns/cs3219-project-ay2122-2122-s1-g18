const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const routes = require('./src/routes')
const socketController = require('./src/controllers/socketController')

const app = express()
const port = process.env.PORT || 8000
const httpServer = require('http').createServer(app)

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.json({
    status: 'healthy'
  })
})

app.use('/api', routes)

app.listen(port, () => {
  console.log('Running on port', port)
})

// socket IO
httpServer.listen(4000)

const io = require('socket.io')(httpServer, {
  cors: {
    origin: 'http://localhost:8080',
    credentials: true
  }
})

io.on('connection', (socket) => {
  socketController.createEventListeners(socket, io)
})

dotenv.config()
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

module.exports = app
