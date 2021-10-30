const CodingQuestion = require('../models/codingQuestion')
exports.getCodingQuestions = function (req, res) {
  CodingQuestion.find()
    .sort({ difficulty: 1, frontend_question_id: 1 })
    .exec()
    .then(questions => {
      res.status(200).json({
        message: 'Success: All Coding questions retrieved!',
        data: questions
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

exports.getCodingQuestion = async function (req, res) {
  const skipBy = req.params.qn_idx
  CodingQuestion.find()
    .sort({ difficulty: 1, frontend_question_id: 1 })
    .skip(Number(skipBy))
    .limit(1)
    .then(questions => {
      res.status(200).json({
        message: 'Success: Coding question retrieved!',
        data: questions
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

exports.getNumCodingQuestions = async function (difficultyLvl) {
  const result = await CodingQuestion.countDocuments({ difficulty: { $eq: difficultyLvl } }).exec().then(
    (res) => { return res })
  return result
}
