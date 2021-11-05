process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const app = require('../index')
// const CodingQuestions = require('../src/models/codingQuestion')

const expect = chai.expect

chai.use(chaiHttp)

// const ObjectId = mongoose.Types.ObjectId
// const codingQuestions = [
//   {
//     _id: new ObjectId('56955ca46063c5600627f393'),
//     name: 'John'
//   }, {
//     _id: new ObjectId('56955ca46063c5600627f392'),
//     name: 'Doe'
//   }
// ]

describe('Coding questions', () => {
  before('Connect to MongoDB', function (done) {
    mongoose.connect(process.env.MONGO_URI_TEST)
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'Unable to connect to MongoDB'))
    db.once('open', function () {
      console.log('Connected to MongoDB')
      done()
    })
    // db.codingquestions.insert(codingQuestions, function (err, docs) {
    //   if (err) {
    //     console.log('Error')
    //   } else {
    //     console.log('Success')
    //   }
  })
})

describe('Route GET /api/coding-questions', () => {
  it('Should GET the coding questions if JWT is valid', (done) => {
    chai.request(app)
      .get('/api/coding-questions/ddd')
      .auth(process.env.JWT_TEST, { type: 'bearer' })
      .end((err, res) => {
        expect(err).to.be.null
        console.log(res)
        expect(res).to.have.status(200)
        expect(res.body.data.question_title).equal('Two Sum')
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
