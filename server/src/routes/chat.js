var express = require('express');
var router = express.Router();
var app = express();
var server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:8081",
    credentials: true
  }
});
// var io = require('socket.io')(server);
var Chat = require('../models/chat.js');

// socket IO
server.listen(4000);

io.on('connection', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
  socket.on('save-message', function (data) {
    console.log('saving data: ' + data);
    io.emit('new-message', { message: data });
  });
});

/* GET ALL CHATS */
router.get('/', function(req, res, next) {
  Chat.find(function (err, products) {
    if (err) return next(err);
    res.json(products);
  });
});

/* GET SINGLE CHAT BY ID */
router.get('/:id', function(req, res, next) {
  Chat.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE CHAT */
router.post('/', function(req, res, next) {
  Chat.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE CHAT */
router.put('/:id', function(req, res, next) {
  Chat.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE CHAT */
router.delete('/:id', function(req, res, next) {
  Chat.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

module.exports = router;
