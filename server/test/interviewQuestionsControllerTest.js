process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const app = require('../index')

const expect = chai.expect

chai.use(chaiHttp)

describe('Interview questions', () => {
  before('Connect to MongoDB', function (done) {
    mongoose.connect(process.env.MONGO_URI_TEST)
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'Unable to connect to MongoDB'))
    db.once('open', function () {
      console.log('Connected to MongoDB')
      done()
    })
  })

  describe('Route GET /api/interview-questions', () => {
    it('Should GET all interview questions if JWT is valid', (done) => {
      chai.request(app)
        .get('/api/interview-questions')
        .auth(process.env.JWT_TEST, { type: 'bearer' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.eq('Success: All interview questions retrieved!')
          expect(res.body.data).to.be.a('array').of('object')
          expect(res.body.data[0].text).to.be.a('string').and.not.be.empty
          done()
        })
    })

    it('Should not GET interview questions if JWT is not provided', (done) => {
      chai.request(app)
        .get('/api/interview-questions')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.eq('Authentication Failed')
          done()
        })
    })

    it('Should not GET interview questions if JWT is invalid', (done) => {
      const invalidJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImthaWVuLmZvb0BnbWFpbC5jb20iLCJ1c2VySWQiOiI2MTgxM2RiOTAzMzZmNjVmYzcwM2FjNzkiLCJ1c2VybmFtZSI6Indha3UiLCJpYXQiOjE2MzU5MTczNTh9.xntZCvnqqPxRvrRuhXDX04kgJnirLeSbAUMb2Ly77w'
      chai.request(app)
        .get('/api/interview-questions')
        .auth(invalidJwt, { type: 'bearer' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.eq('Authentication Failed')
          done()
        })
    })
  })

  after('Disconnect from MongoDB', (done) => {
    const db = mongoose.connection
    db.close()
    db.once('close', () => {
      console.log('Disconnected from MongoDB')
      done()
    })
  })
})
