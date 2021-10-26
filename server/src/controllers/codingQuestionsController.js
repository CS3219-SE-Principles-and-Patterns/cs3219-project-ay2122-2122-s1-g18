const EasyCodingQuestion = require('../models/easyCodingQuestion')
const MediumCodingQuestion = require('../models/mediumCodingQuestion')
const HardCodingQuestion = require('../models/hardCodingQuestion')

exports.getEasyCodingQuestions = function (req, res) {
  EasyCodingQuestion.find()
    .exec()
    .then(questions => {
      res.status(200).json({
        message: 'Success: All Easy coding questions retrieved!',
        data: questions
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

exports.getMediumCodingQuestions = function (req, res) {
  MediumCodingQuestion.find()
    .exec()
    .then(questions => {
      res.status(200).json({
        message: 'Success: All Medium coding questions retrieved!',
        data: questions
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
}

exports.getHardCodingQuestions = function (req, res) {
  HardCodingQuestion.find()
    .exec()
    .then(questions => {
      res.status(200).json({
        message: 'Success: All Hard coding questions retrieved!',
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
  if (matchBy === 'beginner') {
    result = await EasyCodingQuestion.countDocuments().exec().then((res) => { return res })
  } else if (matchBy === 'intermediate') {
    result = await MediumCodingQuestion.countDocuments().exec().then((res) => { return res })
  } else {
    result = await HardCodingQuestion.countDocuments().exec().then((res) => { return res })
  }
  return result
}
