process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const app = require('../index')
const CodingQuestionsController = require('../src/controllers/codingQuestionsController')

const expect = chai.expect

chai.use(chaiHttp)

describe('Coding questions', () => {
  before('Connect to MongoDB', function (done) {
    mongoose.connect(process.env.MONGO_URI_TEST)
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'Unable to connect to MongoDB'))
    db.once('open', function () {
      console.log('Connected to MongoDB')
      done()
    })
  })

  describe('Route GET /api/coding-questions', () => {
    it('Should GET the coding questions if JWT is valid', (done) => {
      chai.request(app)
        .get('/api/coding-questions/5d505646cf6d4fe581014ab1')
        .auth(process.env.JWT_TEST, { type: 'bearer' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body.data.question_title).equal('Two Sum')
          done()
        })
    })

    it('Should not GET interview questions if JWT is not provided', (done) => {
      chai.request(app)
        .get('/api/coding-questions/5d505646cf6d4fe581014ab1')
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(401)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.eq('Authentication Failed')
          done()
        })
    })

    it('Should GET a coding questions of the easy difficulty', (done) => {
      var arr = []
      arr[0] = CodingQuestionsController.getCodingQuestionId('beginner')
      console.log(arr[0])
      expect(['5d505646cf6d4fe581014ab1', '5d505646cf6d4fe581014ab6', '5d505646cf6d4fe581014ab9']).to.have.members(arr)
      done()
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
})
