const CodingQuestion = require('../models/codingQuestion')

function getDifficultyLvlId (difficultyLvlStr) {
  let difficultyLvlId = -1
  switch (difficultyLvlStr) {
    case 'beginner':
      difficultyLvlId = 1
      break
    case 'intermediate':
      difficultyLvlId = 2
      break
    case 'expert':
      difficultyLvlId = 3
  }
  return difficultyLvlId
}

async function getNumOfCodingQuestions (difficultyLvl) {
  const result = await CodingQuestion.countDocuments({ difficulty: { $eq: difficultyLvl } })
    .exec()
    .then((res) => { return res })
  return result
}

async function randSelectCodingQuestionId (difficultyLvl) {
  const numOfCodingQuestions = await getNumOfCodingQuestions(difficultyLvl)
  const rand = Math.floor(Math.random() * (numOfCodingQuestions))
  const questionId = await CodingQuestion.aggregate()
    .match({ difficulty: difficultyLvl })
    .skip(rand)
    .limit(1)
    .then((result) => { return result[0]._id })
    .catch((err) => console.log(err))
  return questionId
}

exports.getCodingQuestionId = async function (matchBy) {
  const difficultyLvl = getDifficultyLvlId(matchBy)
  const codingQuestion1Id = await randSelectCodingQuestionId(difficultyLvl)
  return { codingQuestion1Id }
}

exports.getCodingQuestionIds = async function (matchBy) {
  const difficultyLvl = getDifficultyLvlId(matchBy)
  const codingQuestion1Id = await randSelectCodingQuestionId(difficultyLvl)
  let codingQuestion2Id = await randSelectCodingQuestionId(difficultyLvl)
  while (codingQuestion2Id === codingQuestion1Id) {
    codingQuestion2Id = await randSelectCodingQuestionId(difficultyLvl)
  }
  return { codingQuestion1Id, codingQuestion2Id }
}

exports.getCodingQuestion = function (req, res) {
  const questionId = req.params.id
  CodingQuestion.findById(questionId, (err, question) => {
    if (err) {
      res.status(500).json({
        error: err
      })
      return
    }

    if (!question) {
      res.status(404).json({
        message: 'Question not found'
      })
      return
    }

    res.status(200).json({
      message: 'Success: Coding question retrieved!',
      data: question
    })
  })
}
