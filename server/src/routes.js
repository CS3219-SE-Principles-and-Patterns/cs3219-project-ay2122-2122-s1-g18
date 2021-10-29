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

router.route('/coding-questions/:qn_idx')
  .get(codingQuestionsController.getCodingQuestion)

router.route('/coding-questions')
  .get(codingQuestionsController.getCodingQuestions)

module.exports = router
