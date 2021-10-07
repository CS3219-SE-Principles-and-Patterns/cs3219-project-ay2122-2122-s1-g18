const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const randomBytes = require('randombytes')

const User = require('../models/users')
const Token = require('../models/userToken')
const sendEmail = require('../utils/email')

function validateEmail (email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// GET all users
router.get('/', (req, res) => {
  User.find()
    .exec()
    .then(users => {
      res.status(200).json({
        message: 'Success: All Users Displayed!',
        data: users
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })
})

// GET specific user
router.get('/:userId', (req, res) => {
  const id = req.params.userId
  User.findById(id)
    .exec()
    .then(user => {
      if (user) {
        res.status(200).json({
          message: 'Success: User found!',
          data: user
        })
      } else {
        res.status(400).json({
          message: 'Failure: Invalid ID. No User Found!'
        })
      }
    })
    .catch(err => {
      res.status(500).json({ error: err })
    })
})

// POST a new user
router.post('/signup', (req, res) => {
  // checks if all fields are present
  if (!req.body.email || !req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Failure: All Fields are Compulsory!'
    })
  }
  // validates email format
  if (!validateEmail(req.body.email)) {
    return res.status(400).json({
      message: 'Failure: Invalid Email Format!'
    })
  }
  // search for duplicate username or email
  User.find({ $or: [{ email: req.body.email }, { username: req.body.username }] })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Failure: Duplicate Username/Email!'
        })
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            })
          } else {
            // create user object and save in database with relevant information
            const user = new User({
              email: req.body.email,
              password: hash,
              username: req.body.username
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
                const message = `http://localhost:8000/api/user/verify/${user.id}/${token.token}`
                sendEmail(user.email, 'Verify Email for PeerPrep', message)
                return res.status(200).json({
                  message: 'An email has been sent to your account. Please verify.'
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
})

// GET email verification
router.get('/verify/:id/:token', (req, res) => {
  const id = req.params.id
  const tokenId = req.params.token
  // find user by the unique ._id field
  User.findById(id)
    .exec()
    .then(user => {
      if (user) {
        // find the token associated with this user
        Token.findOne({ userId: user._id, token: tokenId })
          .exec()
          .then(token => {
            // remove the token from database after verification
            Token.findByIdAndRemove(token._id)
              .exec()
              .then()
              .catch(err => {
                return res.status(500).json({
                  message: 'Failure: Unable to Update',
                  error: err
                })
              })
            // update user account status to verified
            User.updateOne({ _id: user._id, verify: true })
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
          })
          .catch(err => {
            return res.status(404).json({
              message: 'Failure: Invalid Link!',
              error: err
            })
          })
      } else {
        return res.status(404).json({
          message: 'Failure: Invalid Link!'
        })
      }
    })
    .catch(err => {
      return res.status(500).json({ error: err })
    })
})

// POST user login
router.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({
      message: 'Authentication Failed: All Fields are Compulsory!'
    })
  }
  User.find({ username: req.body.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: 'Authentication Failed: Wrong Username or Password!'
        })
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
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
          process.env.SECRET_KEY,
          {
            expiresIn: '3h'
          }
          )
          return res.status(200).json({
            message: 'Authentication successful',
            token: token
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
})

// DELETE all users and tokens
router.delete('/', (req, res) => {
  User.deleteMany({})
    .exec()
    .then()
    .catch(err => {
      return res.status(500).json({
        message: 'Failure: Failed to Delete All Contacts!',
        error: err
      })
    })
  Token.deleteMany({})
    .exec()
    .then()
    .catch(err => {
      return res.status(500).json({
        message: 'Failure: Failed to Delete All Tokens!',
        error: err
      })
    })
  return res.status(200).json({
    message: 'Success: All Contacts and Tokens Deleted'
  })
})

module.exports = router
