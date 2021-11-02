const router = require('express').Router()
const authController = require('../controllers/authController')

router.route('/users')
  .post(authController.userLogin)

router.route('/users/reset')
  .put(authController.resetPassword)
  .post(authController.resetPasswordEmail)

router.route('/users/signup')
  .post(authController.createUser)

router.route('/users/verify/:id/:token')
  .get(authController.getEmailVerification)

router.route('/users/verify/checkAuth')
  .get(authController.authenticateJwt)

module.exports = router
