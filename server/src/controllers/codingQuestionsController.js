const CodingQuestion = require('../models/codingQuestion')
exports.getCodingQuestions = function (req, res) {
  CodingQuestion.find()
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

exports.getCodingQuestionsIdx = async function (matchBy) {
  let result
  let difficultyLvl

  switch (matchBy) {
    case 'beginner':
      difficultyLvl = 1
      break
    case 'intermediate':
      difficultyLvl = 2
      break
    case 'expert':
      difficultyLvl = 3
      break
    default:
      difficultyLvl = -1
  }

  if (difficultyLvl === -1) {
    console.log('Unaccepted difficulty level.')
  } else {
    result = await CodingQuestion.countDocuments({ difficulty: { $eq: difficultyLvl } }).exec().then(
      (res) => { return res })
  }
  return result
}
