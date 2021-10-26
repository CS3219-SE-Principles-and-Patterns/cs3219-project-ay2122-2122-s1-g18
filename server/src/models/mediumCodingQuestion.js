const mongoose = require('mongoose')
const Schema = mongoose.Schema

const codingQuestionSchema = new Schema({
  frontend_question_id: {
    type: Number,
    required: true,
    unique: true
  },
  difficulty: {
    type: Number,
    required: true
  },
  question_title: {
    type: String,
    required: true
  },
  question_text: {
    type: String,
    required: true
  },
  question_url: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model('CodingQuestions2', codingQuestionSchema)
