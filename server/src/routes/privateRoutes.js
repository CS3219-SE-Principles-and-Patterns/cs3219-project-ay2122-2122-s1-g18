const router = require('express').Router()
const authController = require('../controllers/authController')
const socketController = require('../controllers/socketController')
const interviewQuestionsController = require('../controllers/interviewQuestionsController')
const codingQuestionsController = require('../controllers/codingQuestionsController')

router.route('/users')
  .put(authController.updatePassword)
  .delete(authController.deleteUser)

router.route('/users/verify/checkAuth')
  .post(authController.userLogout)

router.route('/users/:username/session')
  .get(socketController.hasOngoingSession)

router.route('/interview-questions')
  .get(interviewQuestionsController.getInterviewQuestions)

router.route('/coding-questions/:id')
  .get(codingQuestionsController.getCodingQuestion)

module.exports = router
