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
