process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const app = require('../index')

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
        .get('/api/coding-questions/idd')
        .auth(process.env.JWT_TEST, { type: 'bearer' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body.data.question_title).equal('Two Sum')
          // console.log(res.body)
          done()
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
})
