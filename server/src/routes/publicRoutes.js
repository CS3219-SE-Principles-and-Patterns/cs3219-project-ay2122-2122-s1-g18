const router = require('express').Router()
const authController = require('../controllers/authController')
const checkAuth = require('../utils/checkAuth')

router.route('/users')
  .post(authController.userLogin)

router.route('/users/reset')
  .put(authController.resetPassword)

router.route('/users/signup')
  .post(authController.createUser)

router.route('/users/verify/checkAuth')
  .get(checkAuth.allowIfLoggedIn)

module.exports = router
