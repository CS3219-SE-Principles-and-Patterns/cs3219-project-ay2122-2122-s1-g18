const codingQuestionsController = require('./codingQuestionsController')
const User = require('../models/users')

const waitingUsers = {}
const userMatchingPreferences = new Map()

function addWaitingUser (matchBy, socket) {
  userMatchingPreferences.set(socket.id, matchBy)
  waitingUsers[matchBy] = socket.id
  socket.to('waiting-users-listener').emit('update-waiting-users', waitingUsers)
}

function removeWaitingUser (matchBy, waitingUserId, io) {
  waitingUsers[matchBy] = null
  io.to('waiting-users-listener').emit('update-waiting-users', waitingUsers)
  userMatchingPreferences.delete(waitingUserId)
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
        message: 'Unexpected error'
      })
      return
    }

    if (!user) {
      res.status(404).json({
        message: 'User not found'
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
  socket.on('join-waiting-users-listener', () => handleWaitingUserListenerEvent(socket))
  socket.on('find-match', async (userInfo) => await handleFindMatchEvent(userInfo, socket, io))

  socket.on('proceed-without-match', async (userInfo) => {
    await handleProceedWithoutMatchEvent(userInfo, socket)
  })

  socket.on('join-room', (username, roomInfo) => {
    handleJoinRoomEvent(username, roomInfo, socket, io)
  })

  socket.on('end-wait', (matchBy) => removeWaitingUser(matchBy, socket.id, io))

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
  socket.on('disconnect', async () => await handleDisconnectEvent(socket, io))
}

function handleWaitingUserListenerEvent (socket) {
  socket.join('waiting-users-listener')
  socket.emit('update-waiting-users', waitingUsers)
}

async function handleFindMatchEvent (userInfo, socket, io) {
  setOngoingSession(userInfo.username, socket.id)

  // If there is no waiting user with the same matching preference
  if (!waitingUsers[userInfo.matchBy]) {
    addWaitingUser(userInfo.matchBy, socket)
    return
  }

  const codingQuestions = await codingQuestionsController.getCodingQuestionIds(userInfo.matchBy)
  matchUsers(codingQuestions, userInfo, socket, io)
}

function matchUsers (codingQuestions, userInfo, socket, io) {
  const waitingUserMatched = waitingUsers[userInfo.matchBy]
  const codingRoomInfo = {
    id: `${waitingUserMatched}-${socket.id}`,
    interviewer: randSelectInterviewer(socket.id, waitingUserMatched),
    codingQuestion1Id: codingQuestions.codingQuestion1Id,
    codingQuestion2Id: codingQuestions.codingQuestion2Id
  }
  socket.join(codingRoomInfo.id)
  setCodingRoom(userInfo.username, codingRoomInfo.id)
  socket.to(waitingUserMatched).emit('match-found', codingRoomInfo)
  removeWaitingUser(userInfo.matchBy, waitingUserMatched, io)
}

async function handleProceedWithoutMatchEvent (userInfo, socket) {
  const codingQuestion1Id = await codingQuestionsController.getCodingQuestionId(userInfo.matchBy)
  socket.emit('room-ready', codingQuestion1Id)
}

function handleJoinRoomEvent (username, roomInfo, socket, io) {
  socket.join(roomInfo.id)
  setCodingRoom(username, roomInfo.id)
  io.to(roomInfo.id).emit('coding-room-ready', roomInfo)
}

async function handleDisconnectEvent (socket, io) {
  if (userMatchingPreferences.has(socket.id)) {
    handleSocketDisconnectWhenMatching(socket, io)
  } else {
    await handleSocketDisconnectWhenCoding(socket, io)
  }
  unsetOngoingSession(socket.id)
}

function handleSocketDisconnectWhenMatching (socket, io) {
  const matchBy = userMatchingPreferences.get(socket.id)
  removeWaitingUser(matchBy, socket.id, io)
}

async function handleSocketDisconnectWhenCoding (socket, io) {
  const user = await getUserBySocket(socket.id)
  unsetCodingRoom(socket.id)
  if (user) {
    const leaveRoomChat = {
      room: user.codingRoom,
      name: 'SHReK Tech Bot',
      message: user.username + ' left this room',
      timestamp: getTimeNow()
    }
    sendChat(leaveRoomChat, null, io)
  }
}

function getTimeNow () {
  return new Date().toLocaleTimeString([], { timeZone: 'Asia/Singapore', hour: '2-digit', minute: '2-digit' })
}

function sendChat (chat, socket, io) {
  if (chat.isPrivate && socket) {
    socket.emit('new-chat', chat)
  } else {
    io.to(chat.room).emit('new-chat', chat)
  }
}
