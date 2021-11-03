process.env.NODE_ENV = 'test'

const chai = require('chai')
const chaiHttp = require('chai-http')
const mongoose = require('mongoose')
const io = require('socket.io-client')
const app = require('../index')
const { DEV_SERVER_URI } = require('../src/constants')

const expect = chai.expect

chai.use(chaiHttp)

const SOCKET_OPTIONS = {
  transports: ['websocket'],
  'force new connection': true
}

describe('Sockets', () => {
  let client1, client2, client3
  let client1Id, client2Id

  describe('Event update-waiting-users', () => {
    it('Should send an empty object if there are no waiting users', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1.emit('join-waiting-users-listener')
      })

      client1.on('update-waiting-users', (waitingUsers) => {
        expect(waitingUsers).to.be.a('object').and.be.empty

        client1.disconnect()
        done()
      })
    })

    it('Should send an object with waiting users', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'dummy',
            matchBy: 'beginner'
          })

          client1.emit('join-waiting-users-listener')
        })
      })

      client1.on('update-waiting-users', (waitingUsers) => {
        expect(waitingUsers).to.be.a('object')
        expect(waitingUsers.beginner).to.eq(client2Id)

        client1.disconnect()
        client2.disconnect()
        done()
      })
    })
  })

  describe('Event match-found', () => {
    it('Should send the waiting user info about the coding room', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          expect(codingRoomInfo).to.be.a('object')
          expect(codingRoomInfo.id).to.eq(`${client2Id}-${client1Id}`)
          expect(codingRoomInfo.interviewer).to.be.oneOf([client1Id, client2Id])
          expect(codingRoomInfo.codingQuestion1Id).to.be.a('string').and.not.be.empty
          expect(codingRoomInfo.codingQuestion2Id).to.be.a('string').and.not.be.empty

          client1.disconnect()
          client2.disconnect()
          done()
        })
      })
    })

    it('Should remove the waiting user from the waiting room', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', () => {
          client3 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
          client3.on('connect', () => {
            client3.emit('join-waiting-users-listener')
          })

          client3.on('update-waiting-users', (waitingUsers) => {
            expect(waitingUsers).to.be.a('object')
            expect(waitingUsers.beginner).to.be.null

            client1.disconnect()
            client2.disconnect()
            client3.disconnect()
            done()
          })
        })
      })
    })
  })

  describe('Event coding-room-ready', () => {
    it('Should send both matched users info about the coding room', (done) => {
      let codingRoomInfoReceived
      const testCodingRoomInfo = (client, codingRoomInfo, done) => {
        expect(codingRoomInfo).to.be.a('object')
        expect(codingRoomInfo.id).to.eq(`${client2Id}-${client1Id}`)

        if (!codingRoomInfoReceived) {
          codingRoomInfoReceived = codingRoomInfo
          expect(codingRoomInfo.interviewer).to.be.oneOf([client1Id, client2Id])
          expect(codingRoomInfo.codingQuestion1Id).to.be.a('string').and.not.be.empty
          expect(codingRoomInfo.codingQuestion2Id).to.be.a('string').and.not.be.empty

          client.disconnect()
          return
        }

        expect(codingRoomInfo.interviewer).to.eq(codingRoomInfoReceived.interviewer)
        expect(codingRoomInfo.codingQuestion1Id).to.eq(codingRoomInfoReceived.codingQuestion1Id)
        expect(codingRoomInfo.codingQuestion2Id).to.eq(codingRoomInfoReceived.codingQuestion2Id)

        client.disconnect()
        done()
      }

      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', (codingRoomInfo) => {
          testCodingRoomInfo(client2, codingRoomInfo, done)
        })
      })

      client1.on('coding-room-ready', (codingRoomInfo) => {
        testCodingRoomInfo(client1, codingRoomInfo, done)
      })
    })
  })

  describe('Event coding-room-ready-solo', () => {
    it('Should send the user the coding question id', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id
        client1.emit('proceed-without-match', {
          matchBy: 'beginner'
        })
      })

      client1.on('coding-room-ready-solo', (codingRoomInfo) => {
        expect(codingRoomInfo).to.be.a('object')
        expect(codingRoomInfo.codingQuestion1Id).to.be.a('string').and.not.be.empty
        expect(codingRoomInfo.codingQuestion2Id).to.be.undefined

        client1.disconnect()
        done()
      })
    })
  })

  describe('Event typing', () => {
    it('Should send the username of the typing user', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', () => {
          client2.emit('typing', {
            room: `${client2Id}-${client1Id}`,
            user: 'client2'
          })
        })
      })

      client1.on('typing', (username) => {
        expect(username).to.eq('client2')

        client1.disconnect()
        client2.disconnect()
        done()
      })
    })
  })

  describe('Event stop-typing', () => {
    it('Should be emitted', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', () => {
          client2.emit('stop-typing', `${client2Id}-${client1Id}`)
        })
      })

      client1.on('stop-typing', (data) => {
        expect(data).to.be.undefined

        client1.disconnect()
        client2.disconnect()
        done()
      })
    })
  })

  describe('Event new-chat', () => {
    it('Should send a non-private chat to both matched users', (done) => {
      let chatReceived
      const testChatReceived = (client, chat, done) => {
        expect(chat).to.be.a('object')
        expect(chat.room).to.eq(`${client2Id}-${client1Id}`)
        expect(chat.name).to.eq('client2')
        expect(chat.message).to.eq('hi bye')
        expect(chat.timestamp).to.eq('01:30')

        if (!chatReceived) {
          chatReceived = chat
          client.disconnect()
          return
        }

        client.disconnect()
        done()
      }

      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', () => {
          client2.emit('send-chat', {
            room: `${client2Id}-${client1Id}`,
            name: 'client2',
            message: 'hi bye',
            timestamp: '01:30'
          })
        })

        client2.on('new-chat', (chat) => {
          testChatReceived(client2, chat, done)
        })
      })

      client1.on('new-chat', (chat) => {
        testChatReceived(client1, chat, done)
      })
    })

    it('Should send a private chat to only one user', (done) => {
      let client1NewChat = 0
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', () => {
          client2.emit('send-chat', {
            room: `${client2Id}-${client1Id}`,
            name: 'client2',
            message: 'hi bye',
            timestamp: '01:30',
            isPrivate: true
          })
        })

        client2.on('new-chat', (chat) => {
          expect(chat).to.be.a('object')
          expect(chat.room).to.eq(`${client2Id}-${client1Id}`)
          expect(chat.name).to.eq('client2')
          expect(chat.message).to.eq('hi bye')
          expect(chat.timestamp).to.eq('01:30')
          expect(chat.isPrivate).to.be.true
          expect(client1NewChat).to.eq(0)

          client1.disconnect()
          client2.disconnect()
          done()
        })
      })

      client1.on('new-chat', (chat) => {
        client1NewChat++
      })
    })

    it('Should send the remaining user a chat if a user disconnects', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', () => {
          client2.disconnect()
        })
      })

      client1.on('new-chat', (chat) => {
        expect(chat).to.be.a('object')
        expect(chat.room).to.eq(`${client2Id}-${client1Id}`)
        expect(chat.name).to.eq('SHReK Tech Bot')
        expect(chat.message).to.eq('client2 left this room')
        expect(chat.timestamp).to.be.a('string').and.not.be.empty

        client1.disconnect()
        done()
      })
    })
  })

  describe('Event new-code', () => {
    it('Should send the code changes to the other user', (done) => {
      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', () => {
          client2.emit('update-code', {
            room: `${client2Id}-${client1Id}`,
            codeChanges: ['a', 'b', 'c']
          })
        })
      })

      client1.on('new-code', (codeChanges) => {
        expect(codeChanges).to.be.a('array')

        client1.disconnect()
        client2.disconnect()
        done()
      })
    })
  })

  describe('Event next-question', () => {
    it('Should be emitted to both matched users', (done) => {
      let eventReceived
      const testEventReceived = (client, done) => {
        if (!eventReceived) {
          eventReceived = true
          client.disconnect()
          return
        }

        client.disconnect()
        done()
      }

      client1 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
      client1.on('connect', () => {
        client1Id = client1.id

        client2 = io.connect(DEV_SERVER_URI, SOCKET_OPTIONS)
        client2.on('connect', () => {
          client2Id = client2.id
          client2.emit('find-match', {
            username: 'client2',
            matchBy: 'beginner'
          })
          client1.emit('find-match', {
            username: 'client1',
            matchBy: 'beginner'
          })
        })

        client2.on('match-found', (codingRoomInfo) => {
          client2.emit('join-room', 'client2', codingRoomInfo)
        })

        client2.on('coding-room-ready', () => {
          client2.emit('load-next-question', `${client2Id}-${client1Id}`)
        })

        client2.on('next-question', () => testEventReceived(client2, done))
      })

      client1.on('next-question', () => testEventReceived(client1, done))
    })
  })
})

describe('Sessions', () => {
  before('Connect to MongoDB', function (done) {
    mongoose.connect(process.env.MONGO_URI_TEST)
    const db = mongoose.connection
    db.on('error', console.error.bind(console, 'Unable to connect to MongoDB'))
    db.once('open', function () {
      console.log('Connected to MongoDB')
      done()
    })
  })

  describe('Route GET /api/users/:username/session', () => {
    it('Should GET user and return true', (done) => {
      chai.request(app)
        .get('/api/users/userWithSocket/session')
        .auth(process.env.JWT_TEST, { type: 'bearer' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.eq('User retrieved successfully')
          expect(res.body.hasOngoingSession).to.eq(true)
          done()
        })
    })

    it('Should GET user and return false', (done) => {
      chai.request(app)
        .get('/api/users/userWithoutSocket/session')
        .auth(process.env.JWT_TEST, { type: 'bearer' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(200)
          expect(res.body).to.be.a('object')
          expect(res.body.message).to.eq('User retrieved successfully')
          expect(res.body.hasOngoingSession).to.eq(false)
          done()
        })
    })

    it('Should not GET user if username does not exist', (done) => {
      const USERNAME = 'noSuchUser'
      chai.request(app)
        .get(`/api/users/${USERNAME}/session`)
        .auth(process.env.JWT_TEST, { type: 'bearer' })
        .end((err, res) => {
          expect(err).to.be.null
          expect(res).to.have.status(404)
          expect(res.body).to.be.a('object')
          expect(res.body).to.have.property('message').eq('User not found')
          done()
        })
    })
  })
})
