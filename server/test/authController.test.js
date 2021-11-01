const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../index')
const User = require('../src/models/users')

const expect = chai.expect

chai.use(chaiHttp)

describe('/auth', () => {
  const sampleUser = new User({
    email: 'dummy@gmail.com',
    password: 'hash',
    username: 'dummy',
    verify: true
  })

  before((done) => {
    User.deleteMany({}, (_deleteErr) => {
      sampleUser.save((_saveError) => {
        done()
      })
    })
  })
})
