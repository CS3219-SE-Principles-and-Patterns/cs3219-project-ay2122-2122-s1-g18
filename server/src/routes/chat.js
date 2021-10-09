const express = require('express')
const router = express.Router()
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:8081",
    credentials: true
  }
})
const Chat = require('../models/chat.js')

// socket IO
server.listen(4000)

io.on('connection', socket => {
  console.log('User connected')
  socket.on('save-message', function (data) {
    io.emit('new-message', { message: data })
  })
  socket.on('disconnect', function() {
    console.log('User disconnected')
  })
})

// gets all the chats
router.get('/', (req, res, next) => {
  Chat.find((err, chats) => {
    if (err) {
      res.status(500).json({ 
        status: 'error',
        message: err.message 
      })
    } else {
      res.json({
        status: 'success',
        message: 'chats retrieved successfully',
        data: chats
      })
    }
  })
})

// gets a chat by its id
router.get('/:id', (req, res, next) => {
  Chat.findById(req.params.id, (err, chat) => {
    if (err) {
      res.status(500).json({ 
        status: 'error',
        message: err.message 
      })
    } else {
      res.json({
        status: 'success',
        message: 'chat retrieved successfully',
        data: chat
      })
    }
  })
})

// saves a chat
router.post('/', (req, res, next) => {
  console.log(req.body)
  Chat.create(req.body, (err, chat) => {
    if (err) {
      res.status(400).json({
          status: 'error',
          message: err.message 
      })
    } else {
      res.status(201).json({
          status: 'success',
          message: 'chat saved',
          data: chat
      })
    }
  })
})

// updates a chat
router.put('/:id', (req, res, next) => {
  Chat.findByIdAndUpdate(req.params.id, req.body, (err, chat) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: err.message 
      })
    } else {
      res.json({
        status: 'success',
        message: 'chat updated',
        data: chat
      })
    }
  })
})

// deletes a chat
router.delete('/:id', (req, res, next) => {
  Chat.findByIdAndRemove(req.params.id, req.body, (err, chat) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: err.message 
      })
    } else {
      res.json({
        status: 'success',
        message: 'chat deleted',
        data: chat
      })
    }
  })
})

// deletes all the chats
router.delete('/', (req, res) => {
  Chat.deleteMany({})
    .exec()
    .then()
    .catch(err => {
      return res.status(500).json({
        status: 'error',
        message: err.message
      })
    })
  return res.status(200).json({
    status: 'success',
    message: 'all chats deleted'
  })
})

module.exports = router
