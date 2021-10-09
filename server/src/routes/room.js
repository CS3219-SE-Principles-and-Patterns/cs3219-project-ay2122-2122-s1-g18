var express = require('express');
var router = express.Router();
var Room = require('../models/room.js');

/* GET ALL ROOMS */
router.get('/', function(req, res, next) {
  Room.find(function (err, products) {
    if (err) return next(err);
    res.json(products);
  });
});

/* GET SINGLE ROOM BY ID */
router.get('/:id', function(req, res, next) {
  Room.findById(req.params.id, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* SAVE ROOM */
router.post('/', function(req, res, next) {
  Room.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* UPDATE ROOM */
router.put('/:id', function(req, res, next) {
  Room.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE ROOM */
router.delete('/:id', function(req, res, next) {
  Room.findByIdAndRemove(req.params.id, req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

/* DELETE ALL ROOMS */
router.delete('/', (req, res) => {
  Room.deleteMany({})
    .exec()
    .then()
    .catch(err => {
      return res.status(500).json({
        message: 'Failure: Failed to Delete All Rooms!',
        error: err
      })
    })
  return res.status(200).json({
    message: 'Success: All Rooms Deleted'
  })
})

module.exports = router;
