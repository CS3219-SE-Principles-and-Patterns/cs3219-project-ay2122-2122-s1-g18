const router = require('express').Router()
const authController = require('../controllers/authController')
const socketController = require('../controllers/socketController')
const interviewQuestionsController = require('../controllers/interviewQuestionsController')
const codingQuestionsController = require('../controllers/codingQuestionsController')

router.route('/users')
  .put(authController.updatePassword)
  .delete(authController.deleteUser)

router.route('/users/reset')
  .post(authController.resetPasswordEmail)

router.route('/users/verify/:id/:token')
  .get(authController.getEmailVerification)

router.route('/users/verify/checkAuth')
  .post(authController.addBlacklist)

router.route('/users/:username/session')
  .get(socketController.hasOngoingSession)

router.route('/interview-questions')
  .get(interviewQuestionsController.getInterviewQuestions)
  .post(interviewQuestionsController.createInterviewQuestion)

router.route('/coding-questions/:qn_idx')
  .get(codingQuestionsController.getCodingQuestion)

router.route('/coding-questions')
  .get(codingQuestionsController.getCodingQuestions)

module.exports = router
