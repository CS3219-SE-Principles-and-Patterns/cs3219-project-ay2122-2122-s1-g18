const CodingQuestion = require('../models/codingQuestion')

exports.getCodingQuestions = function (req, res) {
  CodingQuestion.find()
    .exec()
    .then(questions => {
      res.status(200).json({
        message: 'Success: All coding questions retrieved!',
        data: questions
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}
