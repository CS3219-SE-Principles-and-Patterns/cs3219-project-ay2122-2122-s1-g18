const router = require('express').Router()
const authController = require('./controllers/authController')
const checkAuth = require('./utils/checkAuth')

// Auth Routes
router.route('/users')
  .get(authController.getAllUsers)
  .post(authController.userLogin)
  .delete(authController.deleteAllUsers)

router.route('/users/:userId')
  .get(authController.getUser)

router.route('/users/signup')
  .post(authController.createUser)

router.route('/users/verify/:id/:token')
  .get(authController.getEmailVerification)

router.route('/users/verify/checkAuth')
  .get(checkAuth.allowIfLoggedIn)

module.exports = router
