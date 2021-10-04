const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')

const expect = chai.expect

chai.use(chaiHttp)

describe('/', () => {
  it('should return healthy status', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        expect(res.body).to.be.a('object')
        expect(res.body).to.have.property('status').eql('healthy')
        done()
      })
  })
})
