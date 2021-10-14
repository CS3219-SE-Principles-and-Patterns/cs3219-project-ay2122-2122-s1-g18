const jwt = require('jsonwebtoken')

exports.allowIfLoggedIn = (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    jwt.verify(token, process.env.SECRET_KEY)
    return res.status(200).json({
      message: 'Authentication Success'
    })
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed'
    })
  }
}

exports.allowIfLoggedInWithNext = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    console.log(token)
    jwt.verify(token, process.env.SECRET_KEY)
    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed'
    })
  }
}
