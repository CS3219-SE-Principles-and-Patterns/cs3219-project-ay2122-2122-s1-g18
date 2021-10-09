var express = require('express')
var router = express.Router()
var Room = require('../models/room.js')

// gets all the rooms
router.get('/', (req, res, next) => {
  Room.find((err, rooms) => {
    if (err) {
      res.status(500).json({ 
        status: 'error',
        message: err.message 
      })
    } else {
      res.json({
        status: 'success',
        message: 'rooms retrieved successfully',
        data: rooms
      })
    }
  })
})

// gets a room by its id
router.get('/:id', (req, res, next) => {
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
})

// saves a room
router.post('/', (req, res, next) => {
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
})

// updates a room
router.put('/:id', (req, res, next) => {
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
})

// deletes a room
router.delete('/:id', (req, res, next) => {
  Room.findByIdAndRemove(req.params.id, req.body, (err, room) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        message: err.message 
      })
    } else {
      res.json({
        status: 'success',
        message: 'room deleted',
        data: room
      })
    }
  })
})

// deletes all the rooms
router.delete('/', (req, res) => {
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
})

module.exports = router
