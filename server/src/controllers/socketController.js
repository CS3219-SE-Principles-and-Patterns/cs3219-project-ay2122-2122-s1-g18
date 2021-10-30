const { assert } = require('console')
const User = require('../models/users')

const waitingUsers = {}
const userMatchingPreferences = new Map()

function addWaitingUser (matchBy, socket) {
  waitingUsers[matchBy] = socket.id
  socket.to('waiting-users-listener').emit('update-waiting-users', waitingUsers)
}

function removeWaitingUser (matchBy, io) {
  waitingUsers[matchBy] = null
  io.to('waiting-users-listener').emit('update-waiting-users', waitingUsers)
}

function randSelectInterviewer (user1, user2) {
  const rand = Math.round(Math.random())
  if (rand <= 0) {
    return user1
  }
  return user2
}

exports.hasOngoingSession = function (req, res) {
  const username = req.params.username
  User.findOne({ username }, function (err, user) {
    if (err) {
      res.status(500).json({
        message: 'Cannot find user'
      })
      return
    }

    const hasSession = user.socket !== ''
    res.json({
      message: 'User retrieved successfully',
      hasOngoingSession: hasSession
    })
  })
}

function setOngoingSession (username, socket) {
  User.findOneAndUpdate({ username }, { socket }, (err, _user) => {
    if (err) {
      console.log(err)
    }
  })
}

function unsetOngoingSession (socket) {
  User.findOneAndUpdate({ socket }, { socket: '' }, (err, _user) => {
    if (err) {
      console.log(err)
    }
  })
}

function setCodingRoom (username, codingRoom) {
  User.findOneAndUpdate({ username }, { codingRoom }, (err, _user) => {
    if (err) {
      console.log(err)
    }
  })
}

function unsetCodingRoom (socket) {
  User.findOneAndUpdate({ socket }, { codingRoom: '' }, (err, _user) => {
    if (err) {
      console.log(err)
    }
  })
}

async function getUserBySocket (socket) {
  return await User.findOne({ socket })
    .exec()
    .catch((err) => console.log(err))
}

exports.createEventListeners = (socket, io) => {
  socket.on('join-waiting-users-listener', () => {
    socket.join('waiting-users-listener')
    socket.emit('update-waiting-users', waitingUsers)
  })

  socket.on('find-match', (userInfo) => {
    setOngoingSession(userInfo.username, socket.id)

    if (!waitingUsers[userInfo.matchBy]) {
      userMatchingPreferences.set(socket.id, userInfo.matchBy)
      addWaitingUser(userInfo.matchBy, socket)
      return
    }

    const waitingUserMatched = waitingUsers[userInfo.matchBy]
    const codingRoomInfo = {
      id: `${waitingUserMatched}-${socket.id}`,
      interviewer: randSelectInterviewer(socket.id, waitingUserMatched)
    }
    socket.join(codingRoomInfo.id)
    setCodingRoom(userInfo.username, codingRoomInfo.id)
    socket.to(waitingUserMatched).emit('match-found', codingRoomInfo)
    removeWaitingUser(userInfo.matchBy, io)
    userMatchingPreferences.delete(waitingUserMatched)
  })

  socket.on('join-room', (username, roomInfo) => {
    socket.join(roomInfo.id)
    setCodingRoom(username, roomInfo.id)
    io.to(roomInfo.id).emit('coding-room-ready', roomInfo)
  })

  socket.on('end-wait', (matchBy) => {
    assert(waitingUsers[matchBy] === socket.id)
    removeWaitingUser(matchBy, io)
    userMatchingPreferences.delete(socket.id)
  })

  socket.on('typing', (message) => {
    socket.to(message.room).emit('typing', message.user)
  })

  socket.on('stop-typing', (room) => {
    socket.to(room).emit('stop-typing')
  })

  socket.on('send-chat', (chat) => sendChat(chat, socket, io))

  socket.on('update-code', (codeUpdate) => {
    socket.to(codeUpdate.room).emit('new-code', codeUpdate.codeChanges)
  })

  socket.on('load-next-question', (room) => io.to(room).emit('next-question'))

  socket.on('disconnect', () => {
    if (userMatchingPreferences.has(socket.id)) {
      handleSocketDisconnectWhenMatching(socket, io)
    } else {
      handleSocketDisconnectWhenCoding(socket, io)
    }
    unsetOngoingSession(socket.id)
  })
}

function handleSocketDisconnectWhenMatching (socket, io) {
  const matchBy = userMatchingPreferences.get(socket.id)
  removeWaitingUser(matchBy, io)
  userMatchingPreferences.delete(socket.id)
}

async function handleSocketDisconnectWhenCoding (socket, io) {
  const user = await getUserBySocket(socket.id)
  unsetCodingRoom(socket.id)
  const leaveRoomChat = {
    room: user.codingRoom,
    name: 'SHReK Tech Bot',
    message: user.username + ' left this room',
    timestamp: getTimeNow()
  }
  sendChat(leaveRoomChat, null, io)
}

function getTimeNow () {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function sendChat (chat, socket, io) {
  if (chat.isPrivate && socket) {
    socket.emit('new-chat', chat)
  } else {
    io.to(chat.room).emit('new-chat', chat)
  }
}
