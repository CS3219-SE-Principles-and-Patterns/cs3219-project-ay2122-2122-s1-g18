const mongoose = require('mongoose')
const Schema = mongoose.Schema

const blackListSchema = new Schema({
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    expires: '180m',
    default: Date.now
  }
})

const BlackListToken = mongoose.model('BlacklistToken', blackListSchema)

module.exports = BlackListToken
