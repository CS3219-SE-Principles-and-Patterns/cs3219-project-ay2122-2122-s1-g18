const Room = require('../models/room.js')

// gets all the rooms
exports.getAllRooms = function (req, res, next) {
  Room.find()
    .exec()
    .then(rooms => {
      res.status(200).json({
        status: 'success',
        message: 'rooms retrieved successfully',
        data: rooms
      })
    })
    .catch(err => {
      res.status(500).json({
        status: 'error',
        message: err.message
      })
    })
}

// gets a room by its id
exports.getRoom = function (req, res, next) {
  Room.findById(req.params.id, (err, room) => {
    if (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      })
    } else {
      res.json({
        status: 'success',
        message: 'room retrieved successfully',
        data: room
      })
    }
  })
}

// saves a room
exports.saveRoom = function (req, res, next) {
  Room.create(req.body, (err, room) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      })
    } else {
      res.status(201).json({
        status: 'success',
        message: 'room saved',
        data: room
      })
    }
  })
}

// updates a room
exports.updateRoom = function (req, res, next) {
  Room.findByIdAndUpdate(req.params.id, req.body, (err, room) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: err.message
      })
    } else {
      res.json({
        status: 'success',
        message: 'room updated',
        data: room
      })
    }
  })
}

// deletes a room
exports.deleteRoom = function (req, res, next) {
  Room.findByIdAndRemove(req.params.id, req.body, (err, room) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: 'failed to delete room'
      })
    } else {
      res.json({
        status: 'success',
        message: 'room deleted',
        data: room
      })
    }
  })
}

// deletes all the rooms
exports.deleteAllRooms = function (req, res) {
  Room.deleteMany({})
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
    message: 'all rooms deleted'
  })
}
