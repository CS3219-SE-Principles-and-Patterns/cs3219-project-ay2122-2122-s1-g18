const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const randomBytes = require('randombytes')

const User = require('../models/users')
const Token = require('../models/userToken')
const BlacklistToken = require('../models/blacklistToken')
const sendEmail = require('../utils/email')

const constants = require('../constants')

function validateEmail (email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// DELETE a new user
exports.deleteUser = function (req, res) {
  const username = req.body.username.trim()
  const password = req.body.password.trim()

  const regex = (string) => new RegExp(['^', string, '$'].join(''), 'i')
  User.find({ username: regex(username) })
    .exec()
    .then(user => {
      if (user.length > 0) {
        bcrypt.compare(password, user[0].password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: 'Wrong password. Unable to delete account'
            })
          }
          if (result) {
            User.deleteOne({ username: username })
              .exec()
              .then(() => {
                return res.status(200).json({
                  message: 'Success: Account Deleted'
                })
              })
              .catch(() => {
                return res.status(500).json({
                  message: 'Failure: Unable to delete account'
                })
              })
          } else {
            return res.status(401).json({
              message: 'Wrong password. Unable to delete account'
            })
          }
        })
      } else {
        return res.status(500).json({
          message: 'Cannot find user. Unable to delete account'
        })
      }
    })
}

// PUT a user
exports.updatePassword = function (req, res) {
  const username = req.body.username.trim()
  const oldPassword = req.body.oldPassword.trim()
  const newPassword = req.body.newPassword.trim()

  const regex = (string) => new RegExp(['^', string, '$'].join(''), 'i')
  User.findOne({ username: regex(username) })
    .exec()
    .then(user => {
      if (user) {
        bcrypt.compare(oldPassword, user.password, (err, result) => {
          if (err) {
            return res.status(401).json({
              message: 'Wrong password. Unable to reset password'
            })
          }
          if (result) {
            bcrypt.hash(newPassword, 10, (err, hash) => {
              if (err) {
                return res.status(500).json({
                  error: err
                })
              } else {
                user.password = hash
                user.save()
                  .then(() => {
                    return res.status(200).json({
                      message: 'Success: Password Updated'
                    })
                  })
                  .catch(err => {
                    return res.status(500).json({
                      error: err
                    })
                  })
              }
            })
          } else {
            return res.status(401).json({
              message: 'Wrong password. Unable to reset password'
            })
          }
        })
      } else {
        return res.status(500).json({
          message: 'Cannot find user. Unable to change password'
        })
      }
    })
    .catch((err) => {
      console.log(err)
    })
}

// POST a new user
exports.createUser = function (req, res) {
  const email = req.body.email.trim()
  const username = req.body.username.trim()
  const password = req.body.password.trim()

  // checks if all fields are present
  if (!email || !username || !password) {
    return res.status(400).json({
      message: 'Failure: All Fields are Compulsory!'
    })
  }
  // validates email format
  if (!validateEmail(email)) {
    return res.status(400).json({
      message: 'Failure: Invalid Email Format!'
    })
  }
  // search for duplicate username or email
  const regex = (string) => new RegExp(['^', string, '$'].join(''), 'i')
  User.find({ $or: [{ email: regex(email) }, { username: regex(username) }] })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Failure: Duplicate Username/Email!'
        })
      } else {
        bcrypt.hash(password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            })
          } else {
            // create user object and save in database with relevant information
            const user = new User({
              email: email,
              password: hash,
              username: username
            })
            user.save()
              .then()
              .catch(err => {
                return res.status(500).json({
                  error: err
                })
              })
            // create a new token use to verify this user
            const token = new Token({
              userId: user._id,
              token: randomBytes(16).toString('hex')
            })
            token.save()
              .then(() => {
                let message = 'Hello from SHReK Tech!\nPlease click on the link below to verify your account:\n'
                message += process.env.NODE_ENV === 'production'
                  ? `${constants.PRODUCTION_VERIFY_EMAIL_URI}/${user.id}/${token.token}`
                  : `${constants.DEV_VERIFY_EMAIL_URI}/${user.id}/${token.token}`
                sendEmail(user.email, 'Verify your email for SHReK Tech', message)
                return res.status(200).json({
                  message: 'A verification email has been sent to your account. Please verify your email before proceeding.'
                })
              })
              .catch(err => {
                return res.status(500).json({
                  error: err
                })
              })
          }
        })
      }
    })
}

// GET email verification
exports.getEmailVerification = async function (req, res) {
  const id = req.params.id
  const tokenId = req.params.token
  // find user by the unique ._id field
  const user = await User.findById(id)
    .exec()
    .then(user => {
      return user
    })
    .catch(err => {
      return res.status(500).json({ error: err })
    })
  if (user) {
    // find the token associated with this user
    const token = await Token.findOne({ userId: user._id, token: tokenId })
      .exec()
      .then(token => {
        // remove the token from database after verification
        return token
      })
      .catch(err => {
        return res.status(404).json({
          message: 'Failure: Invalid Token!',
          error: err
        })
      })
    if (token) {
      Token.findByIdAndRemove(token._id)
        .exec()
        .then()
        .catch(err => {
          return res.status(500).json({
            message: 'Failure: Unable to Remove Token',
            error: err
          })
        })
      // update user account status to verified
      User.updateOne({ _id: user._id }, { verify: true })
        .exec()
        .then(() => {
          return res.status(200).json({
            message: 'Email Verified. You can log in to your account now.'
          })
        })
        .catch(err => {
          return res.status(500).json({
            message: 'Failure: Unable to Update',
            error: err
          })
        })
    } else {
      return res.status(404).json({
        message: 'Failure: Invalid Link!'
      })
    }
  } else {
    return res.status(404).json({
      message: 'Failure: Invalid Link!'
    })
  }
}

exports.userLogin = function (req, res) {
  const username = req.body.username.trim()
  const password = req.body.password.trim()
  if (!username || !password) {
    return res.status(400).json({
      message: 'Authentication Failed: All Fields are Compulsory!'
    })
  }
  User.find({ username: username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Authentication Failed: Wrong Username or Password!'
        })
      }
      bcrypt.compare(password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: 'Authentication Failed: Wrong Username or Password!'
          })
        }
        if (user[0].verify && result) {
          const token = jwt.sign({
            email: user[0].email,
            userId: user[0]._id,
            username: user[0].username
          },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: '3h'
          }
          )
          return res.status(200).json({
            message: 'Authentication successful',
            token: token,
            username: user[0].username
          })
        }
        if (!user[0].verify) {
          return res.status(401).json({
            message: 'Authentication Failed: Please verify account before continuing.'
          })
        } else {
          return res.status(401).json({
            message: 'Authentication Failed: Wrong Username or Password!'
          })
        }
      })
    })
    .catch(err => {
      return res.status(500).json({
        error: err
      })
    })
}

// POST blacklist token
exports.addBlacklist = function (req, res) {
  const temp = req.headers.authorization.split(' ')[1]
  // checks if token is present
  if (!temp) {
    return res.status(400).json({
      message: 'Failure: Unable to log out'
    })
  }
  // create user object and save in database with relevant information
  const token = new BlacklistToken({
    token: temp
  })
  token.save()
    .then(() => {
      return res.status(200).json({
        message: 'Success'
      })
    })
    .catch(err => {
      return res.status(500).json({
        error: err
      })
    })
}

// POST email to get reset password link
exports.resetPasswordEmail = function (req, res) {
  const email = req.body.email.trim()

  const regex = (string) => new RegExp(['^', string, '$'].join(''), 'i')

  // validates email format
  if (!validateEmail(email)) {
    return res.status(400).json({
      message: 'Failure: Invalid Email Format!'
    })
  }

  User.findOne({ email: regex(email) })
    .exec()
    .then(user => {
      if (user) {
        const token = new Token({
          userId: user._id,
          token: randomBytes(16).toString('hex')
        })
        token.save()
          .then(() => {
            let message = 'If you have requested for a password reset, please click on the link below to reset your password:\n'
            message += process.env.NODE_ENV === 'production'
              ? `${constants.PRODUCTION_RESET_PASSWORD_URI}/${user._id}/${token.token}`
              : `${constants.DEV_RESET_PASSWORD_URI}/${user._id}/${token.token}`
            sendEmail(user.email, 'Request to reset password for SHReK Tech', message)
            return res.status(200).json({
              message: 'A reset email has been sent to your account.'
            })
          })
          .catch(err => {
            return res.status(500).json({
              error: err
            })
          })
      } else {
        return res.status(404).json({
          message: 'Failure: User not found.'
        })
      }
    })
    .catch(err => {
      return res.status(500).json({
        error: err
      })
    })
}

// PUT new password
exports.resetPassword = async function (req, res) {
  const password = req.body.newPassword.trim()
  const userId = req.body.userId.trim()
  const tokenId = req.body.token.trim()

  const user = await User.findById(userId)
    .exec()
    .then(user => {
      return user
    })
    .catch(err => {
      return res.status(500).json({
        message: 'Unable to reset password.',
        error: err
      })
    })
  if (user) {
    const token = await Token.findOne({ userId: user._id, token: tokenId })
      .exec()
      .then(token => {
        // remove the token from database after verification
        return token
      })
      .catch(err => {
        return res.status(500).json({
          message: 'Unable to reset password.',
          error: err
        })
      })
    if (token) {
      Token.findByIdAndRemove(token._id)
        .exec()
        .then()
        .catch(err => {
          return res.status(500).json({
            message: 'Failure: Unable to Remove Token',
            error: err
          })
        })

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err
          })
        } else {
          user.password = hash
          user.save()
            .then(() => {
              return res.status(200).json({
                message: 'Success: Password Updated'
              })
            })
            .catch(err => {
              return res.status(500).json({
                error: err
              })
            })
        }
      })
    } else {
      return res.status(500).json({
        message: 'Failure: Invalid Token!'
      })
    }
  }
}
