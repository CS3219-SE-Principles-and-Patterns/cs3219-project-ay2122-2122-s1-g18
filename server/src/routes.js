const router = require('express').Router()
const authController = require('./controllers/authController')
const checkAuth = require('./utils/checkAuth')
const roomController = require('./controllers/roomController')
const realtimeController = require('./controllers/realtimeController')

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

// Room Routes
router.route('/rooms')
  .get(roomController.getAllRooms)
  .post(roomController.saveRoom)
  .delete(roomController.deleteAllRooms)

router.route('/rooms/:id')
  .get(roomController.getRoom)
  .put(roomController.updateRoom)
  .delete(roomController.deleteRoom)

// Realtime Routes
router.route('/chats')
  .get(realtimeController.getAllChats)
  .post(realtimeController.saveChat)
  .delete(realtimeController.deleteAllChats)

router.route('/chats/:id')
  .get(realtimeController.getChat)
  .put(realtimeController.updateChat)
  .delete(realtimeController.deleteChat)

module.exports = router
