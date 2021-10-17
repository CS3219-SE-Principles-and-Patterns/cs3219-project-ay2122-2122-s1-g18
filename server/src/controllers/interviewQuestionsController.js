const InterviewQuestion = require('../models/interviewQuestion')

exports.getInterviewQuestions = function (req, res) {
  InterviewQuestion.find()
    .exec()
    .then(questions => {
      res.status(200).json({
        message: 'Success: All interview questions retrieved!',
        data: questions
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

// Included for the ease of adding interview questions
// Can be removed once the interview questions are finalised
exports.createInterviewQuestion = function (req, res) {
  const text = req.body.text.trim()

  if (!text) {
    return res.status(400).json({
      message: 'Failure: All Fields are Compulsory!'
    })
  }

  // search for duplicate question
  InterviewQuestion.find({ text })
    .exec()
    .then(question => {
      if (question.length >= 1) {
        return res.status(409).json({
          message: 'Failure: Duplicate question!'
        })
      } else {
        const interviewQuestion = new InterviewQuestion({ text })
        interviewQuestion.save()
          .then()
          .catch(err => {
            return res.status(500).json({
              error: err
            })
          })
      }
    })
}
