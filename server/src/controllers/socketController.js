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

exports.createEventListeners = (socket, io) => {
  socket.on('join-waiting-users-listener', () => {
    socket.join('waiting-users-listener')
  })

  socket.on('find-match', (matchBy) => {
    userMatchingPreferences.set(socket.id, matchBy)

    if (!waitingUsers[matchBy]) {
      addWaitingUser(matchBy, socket)
      return
    }

    // Use waiting user's socket id as room id
    const codingRoomId = waitingUsers[matchBy]
    socket.join(codingRoomId)
    io.to(codingRoomId).emit('match-found', codingRoomId)
    removeWaitingUser(matchBy, io)
  })

  socket.on('end-wait', (matchBy) => {
    assert(waitingUsers[matchBy] === socket.id)
    removeWaitingUser(matchBy, io)
    userMatchingPreferences.delete(socket.id)
  })

  socket.on('send-chat', (chat) => {
    io.to(chat.room).emit('new-chat', chat)
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
