const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')

const expect = chai.expect

chai.use(chaiHttp)
// eslint-disable-next-line
const should = chai.should()

describe('/socket', () => {
  describe('Route GET /api/users/:username/session', () => {
    it('Should GET user and return true', (done) => {
      const USERNAME = 'userWithSocket'
      chai.request(app)
        .get(`/api/users/${USERNAME}/session`)
        .end((err, res) => {
          expect(err).to.be.null
          res.should.have.status(200)
          res.body.should.be.a('object')
          res.body.should.have.property('message').eql('User retrieved successfully')
          res.body.should.have.property('hasOngoingSession').eql(true)
          done()
        })
    })

    it('Should GET user and return false', (done) => {
      const USERNAME = 'userWithoutSocket'
      chai.request(app)
        .get(`/api/users/${USERNAME}/session`)
        .then((res) => {
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.eql('User retrieved successfully')
          expect(res.body.hasOngoingSession).to.eql(false)
          done()
        }).catch(done)
    })

    it('Should not GET user if username does not exist', (done) => {
      const USERNAME = 'noSuchUser'
      chai.request(app)
        .get(`/api/users/${USERNAME}/session`)
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message').eql('User not found')
          done()
        })
    })
  })
})
