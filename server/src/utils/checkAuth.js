const jwt = require('jsonwebtoken')
const BlacklistToken = require('../models/blacklistToken')

exports.allowIfLoggedIn = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.JWT_SECRET_KEY)
    BlacklistToken.find({ token: token })
      .exec()
      .then((result) => {
        if (result.length > 0) {
          return res.status(401).json({
            message: 'Authentication Failed'
          })
        } else {
          return res.status(200).json({
            message: 'Authentication Success'
          })
        }
      })
      .catch((error) => {
        console.log(error)
      })
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication Failed'
    })
  }
}
