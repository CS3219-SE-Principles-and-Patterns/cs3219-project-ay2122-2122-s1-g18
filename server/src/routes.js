const router = require('express').Router()
const authController = require('./controllers/authController')
const socketController = require('./controllers/socketController')
const checkAuth = require('./utils/checkAuth')
const interviewQuestionsController = require('./controllers/interviewQuestionsController')

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

router.route('/users/:username/session')
  .get(socketController.hasOngoingSession)

router.route('/interview-questions')
  .get(interviewQuestionsController.getInterviewQuestions)
  .post(interviewQuestionsController.createInterviewQuestion)

module.exports = router
