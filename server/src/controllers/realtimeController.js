const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:8080',
    credentials: true
  }
})
const Realtime = require('../models/realtime.js')

// socket IO
server.listen(4000)
const waitingUsers = []

io.on('connection', socket => {
  socket.on('find-match', (matchBy) => {
    if (!waitingUsers[matchBy]) {
      waitingUsers[matchBy] = socket.id
      return
    }
    socket.join(waitingUsers[matchBy])
    socket.emit('match-found', waitingUsers[matchBy])
    socket.to(waitingUsers[matchBy]).emit('match-found', waitingUsers[matchBy])
    waitingUsers[matchBy] = null
  })

  socket.on('end-wait', (matchBy) => {
    if (waitingUsers[matchBy] === socket.id) {
      waitingUsers[matchBy] = null
    }
  })

  socket.on('save-chat', function (data) {
    io.emit('new-chat', { message: data })
  })

  socket.on('new-code', function (data) {
    io.emit('update-code', data)
  })
})

// gets all the chats
exports.getAllChats = function (req, res, next) {
  Realtime.find()
    .exec()
    .then(chats => {
      res.status(200).json({
        status: 'success',
        message: 'chats retrieved successfully',
        data: chats
      })
    })
    .catch(err => {
      res.status(500).json({
        status: 'error',
        message: err.message
      })
    })
}

// gets a chat by its id
exports.getChat = function (req, res, next) {
  Realtime.findById(req.params.id, (err, chat) => {
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
}

// saves a chat
exports.saveChat = function (req, res, next) {
  Realtime.create(req.body, (err, chat) => {
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
}

// updates a chat
exports.updateChat = function (req, res, next) {
  Realtime.findByIdAndUpdate(req.params.id, req.body, (err, chat) => {
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
}

// deletes a chat
exports.deleteChat = function (req, res, next) {
  Realtime.findByIdAndRemove(req.params.id, req.body, (err, chat) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: 'failed to delete chat'
      })
    } else {
      res.json({
        status: 'success',
        message: 'chat deleted',
        data: chat
      })
    }
  })
}

// deletes all the chats
exports.deleteAllChats = function (req, res) {
  Realtime.deleteMany({})
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
}
