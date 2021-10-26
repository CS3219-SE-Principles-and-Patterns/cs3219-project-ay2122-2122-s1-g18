const router = require('express').Router()
const authController = require('./controllers/authController')
const checkAuth = require('./utils/checkAuth')
const interviewQuestionsController = require('./controllers/interviewQuestionsController')
const codingQuestionsController = require('./controllers/codingQuestionsController')


// Auth Routes
router.route('/users')
  .post(authController.userLogin)
  .put(authController.updatePassword)
  .delete(authController.deleteUser)

router.route('/users/reset')
  .post(authController.resetPasswordEmail)
  .put(authController.resetPassword)

router.route('/users/signup')
  .post(authController.createUser)

router.route('/users/verify/:id/:token')
  .get(authController.getEmailVerification)

router.route('/users/verify/checkAuth')
  .get(checkAuth.allowIfLoggedIn)
  .post(authController.addBlacklist)

router.route('/interview-questions')
  .get(interviewQuestionsController.getInterviewQuestions)
  .post(interviewQuestionsController.createInterviewQuestion)

router.route('/easy-coding-questions')
  .get(codingQuestionsController.getEasyCodingQuestions)

router.route('/medium-coding-questions')
  .get(codingQuestionsController.getMediumCodingQuestions)

router.route('/hard-coding-questions')
  .get(codingQuestionsController.getHardCodingQuestions)

module.exports = router
