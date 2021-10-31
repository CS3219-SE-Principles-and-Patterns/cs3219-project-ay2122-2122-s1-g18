const chai = require('chai')
const chaiHttp = require('chai-http')
// const mongoose = require('mongoose')
const app = require('../index')

const expect = chai.expect

chai.use(chaiHttp)

describe('/auth', () => {
  describe('Route POST /api/users/signup', () => {
    it('Should POST a new user', (done) => {
      const userToAdd = {
        username: 'shrekTechTest',
        password: 'shrekTech',
        email: 'peerPrep@gmail.com'
      }
      chai.request(app)
        .post('/api/users/signup')
        .send(userToAdd)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('A verification email has been sent to your account. ' +
            'Please verify your email before proceeding.')
          done()
        })
    })

    it('Should not POST user if there a missing fields', (done) => {
      const userToAdd = {
        username: '',
        password: 'shrekTech',
        email: 'peerPrep@gmail.com'
      }
      chai.request(app)
        .post('/api/users/signup')
        .send(userToAdd)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Failure: All Fields are Compulsory!')
          done()
        })
    })

    it('Should not POST user if email format is invalid', (done) => {
      const userToAdd = {
        username: 'shrekTechTest',
        password: 'shrekTech',
        email: 'peerPrep'
      }
      chai.request(app)
        .post('/api/users/signup')
        .send(userToAdd)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(400)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Failure: Invalid Email Format!')
          done()
        })
    })

    it('Should not POST a user if username already exists', (done) => {
      const userToAdd = {
        username: 'shrekTechTest',
        password: 'shrekTech',
        email: 'peerPrep1@gmail.com'
      }
      chai.request(app)
        .post('/api/users/signup')
        .send(userToAdd)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(409)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Failure: Duplicate Username/Email!')
          done()
        })
    })

    it('Should not POST a user if email already exists', (done) => {
      const userToAdd = {
        username: 'shrekTechTest2',
        password: 'shrekTech',
        email: 'peerPrep@gmail.com'
      }
      chai.request(app)
        .post('/api/users/signup')
        .send(userToAdd)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(409)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Failure: Duplicate Username/Email!')
          done()
        })
    })
  })

  describe('Route POST /api/users/', () => {
    it('Should PUT new password', (done) => {
      const userToUpdate = {
        username: 'shrekTechTest',
        oldPassword: 'shrekTech',
        newPassword: 'shrekTechNew'
      }
      chai.request(app)
        .put('/api/users')
        .send(userToUpdate)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Success: Password Updated')
          done()
        })
    })

    it('Should not PUT if credentials are wrong', (done) => {
      const userToUpdate = {
        username: 'shrekTechTest',
        oldPassword: 'shrekTech',
        newPassword: 'shrekTechNew'
      }
      chai.request(app)
        .put('/api/users')
        .send(userToUpdate)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Wrong password. Unable to reset password')
          done()
        })
    })

    it('Should not DELETE user if credentials are wrong', (done) => {
      const userToDelete = {
        username: 'shrekTechTest',
        password: 'shrekTech'
      }
      chai.request(app)
        .delete('/api/users')
        .send(userToDelete)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Wrong password. Unable to delete account')
          done()
        })
    })

    it('Should DELETE user', (done) => {
      const userToDelete = {
        username: 'shrekTechTest',
        password: 'shrekTechNew'
      }
      chai.request(app)
        .delete('/api/users')
        .send(userToDelete)
        // eslint-disable-next-line node/handle-callback-err
        .end((err, res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.equal('Success: Account Deleted')
          done()
        })
    })
  })
})