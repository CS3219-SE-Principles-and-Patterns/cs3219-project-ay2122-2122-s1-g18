const router = require('express').Router()
const authController = require('../controllers/authController')

router.route('/users')
  .post(authController.userLogin)

router.route('/users/reset')
  .put(authController.resetPassword)

router.route('/users/signup')
  .post(authController.createUser)

router.route('/users/verify/checkAuth')
  .get(authController.authenticateJwt)

module.exports = router
