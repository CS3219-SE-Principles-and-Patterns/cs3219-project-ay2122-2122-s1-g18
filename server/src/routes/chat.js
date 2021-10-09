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

io.on('connection', function (socket) {
  console.log('User connected')
  socket.on('save-message', function (data) {
    io.emit('new-message', { message: data })
  })
  socket.on('disconnect', function() {
    console.log('User disconnected')
  })
})

// gets all the chats
router.get('/', function(req, res, next) {
  Chat.find(function (err, products) {
    if (err) return next(err)
    res.json(products)
  })
})

// gets a chat by its id
router.get('/:id', function(req, res, next) {
  Chat.findById(req.params.id, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

// saves a chat
router.post('/', function(req, res, next) {
  Chat.create(req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

// updates a chat
router.put('/:id', function(req, res, next) {
  Chat.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

// deletes a chat
router.delete('/:id', function(req, res, next) {
  Chat.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err)
    res.json(post)
  })
})

// deletes all the chats
router.delete('/', (req, res) => {
  Chat.deleteMany({})
    .exec()
    .then()
    .catch(err => {
      return res.status(500).json({
        message: 'Failure: Failed to Delete All Chats!',
        error: err
      })
    })
  return res.status(200).json({
    message: 'Success: All Chats Deleted'
  })
})

module.exports = router
