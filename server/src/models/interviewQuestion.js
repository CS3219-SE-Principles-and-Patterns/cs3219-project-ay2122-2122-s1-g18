const mongoose = require('mongoose')
const Schema = mongoose.Schema

const interviewQuestionSchema = new Schema({
  text: {
    type: String,
    required: true,
    unique: true
  }
})

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema)
