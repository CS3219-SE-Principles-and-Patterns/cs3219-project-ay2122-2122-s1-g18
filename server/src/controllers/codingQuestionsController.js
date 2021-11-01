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
  let result2 = Math.floor(Math.random() * (numOfCodingQuestions))

  const difficultyLvlUnaccounted = difficultyLvl - 1
  for (let i = 1; i <= difficultyLvlUnaccounted; i++) {
    result2 += await getNumOfCodingQuestions(i)
  }
  return result2
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
