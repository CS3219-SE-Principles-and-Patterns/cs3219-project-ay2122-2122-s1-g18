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
      const expectedIds = []
      const ObjectId = mongoose.Types.ObjectId
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab1'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab6'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab8'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab9'))
      const resultId = []
      CodingQuestionsController.getCodingQuestionId('beginner').then(
        (result) => {
          resultId.push(result.codingQuestion1Id)
          expect(expectedIds).to.deep.include.members(resultId)
        }).then(done, done)
    })

    it('Should GET a coding questions of the intermediate difficulty', (done) => {
      const expectedIds = []
      const ObjectId = mongoose.Types.ObjectId
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab2'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab3'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab5'))
      const resultId = []
      CodingQuestionsController.getCodingQuestionId('intermediate').then(
        (result) => {
          resultId.push(result.codingQuestion1Id)
          expect(expectedIds).to.deep.include.members(resultId)
        }).then(done, done)
    })

    it('Should GET a coding questions of the expert difficulty', (done) => {
      const expectedIds = []
      const ObjectId = mongoose.Types.ObjectId
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab4'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab7'))
      const resultId = []
      CodingQuestionsController.getCodingQuestionId('expert').then(
        (result) => {
          resultId.push(result.codingQuestion1Id)
          expect(expectedIds).to.deep.include.members(resultId)
        }).then(done, done)
    })

    it('Should GET 2 coding questions of the easy difficulty', (done) => {
      const expectedIds = []
      const ObjectId = mongoose.Types.ObjectId
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab1'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab6'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab8'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab9'))
      const resultIds = []
      CodingQuestionsController.getCodingQuestionIds('beginner').then(
        (result) => {
          console.log(result.codingQuestion1Id)
          console.log(result.codingQuestion2Id)
          expect(result.codingQuestion1Id).to.not.equal(result.codingQuestion2Id)
          resultIds.push(result.codingQuestion1Id)
          resultIds.push(result.codingQuestion2Id)
          expect(expectedIds).to.deep.include.members(resultIds)
        }).then(done, done)
    })

    it('Should GET 2 coding questions of the intermediate difficulty', (done) => {
      const expectedIds = []
      const ObjectId = mongoose.Types.ObjectId
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab2'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab3'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab5'))
      const resultIds = []
      CodingQuestionsController.getCodingQuestionIds('intermediate').then(
        (result) => {
          expect(result.codingQuestion1Id).to.not.equal(result.codingQuestion2Id)
          resultIds.push(result.codingQuestion1Id)
          resultIds.push(result.codingQuestion2Id)
          expect(expectedIds).to.deep.include.members(resultIds)
        }).then(done, done)
    })

    it('Should GET 2 coding questions of the expert difficulty', (done) => {
      const expectedIds = []
      const ObjectId = mongoose.Types.ObjectId
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab4'))
      expectedIds.push(new ObjectId('5d505646cf6d4fe581014ab7'))
      const resultIds = []
      CodingQuestionsController.getCodingQuestionIds('expert').then(
        (result) => {
          expect(result.codingQuestion1Id).to.not.equal(result.codingQuestion2Id)
          resultIds.push(result.codingQuestion1Id)
          resultIds.push(result.codingQuestion2Id)
          expect(expectedIds).to.deep.include.members(resultIds)
        }).then(done, done)
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
