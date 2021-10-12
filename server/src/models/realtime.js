const mongoose = require('mongoose')

const RealtimeSchema = new mongoose.Schema({
  room: String,
  name: String,
  message: String,
  created_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Realtime', RealtimeSchema)
