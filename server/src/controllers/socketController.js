const { assert } = require('console')

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

exports.createEventListeners = (socket, io) => {
  socket.on('join-waiting-users-listener', () => {
    socket.join('waiting-users-listener')
  })

  socket.on('find-match', (matchBy) => {
    if (!waitingUsers[matchBy]) {
      userMatchingPreferences.set(socket.id, matchBy)
      addWaitingUser(matchBy, socket)
      return
    }

    const waitingUserMatched = waitingUsers[matchBy]
    // Use waiting user's socket id as room id
    const codingRoomInfo = {
      id: waitingUserMatched,
      interviewer: randSelectInterviewer(socket.id, waitingUserMatched)
    }
    socket.join(codingRoomInfo.id)
    io.to(codingRoomInfo.id).emit('match-found', codingRoomInfo)
    removeWaitingUser(matchBy, io)
  })

  socket.on('end-wait', (matchBy) => {
    assert(waitingUsers[matchBy] === socket.id)
    removeWaitingUser(matchBy, io)
    userMatchingPreferences.delete(socket.id)
  })

  socket.on('send-chat', (chat) => {
    if (chat.isPrivate) {
      socket.emit('new-chat', chat)
    } else {
      io.to(chat.room).emit('new-chat', chat)
    }
  })

  socket.on('update-code', (codeUpdate) => {
    io.to(codeUpdate.room).emit('new-code', codeUpdate.code)
  })

  socket.on('disconnect', () => {
    if (userMatchingPreferences.has(socket.id)) {
      const matchBy = userMatchingPreferences.get(socket.id)
      removeWaitingUser(matchBy, io)
      userMatchingPreferences.delete(socket.id)
    }
  })
}
