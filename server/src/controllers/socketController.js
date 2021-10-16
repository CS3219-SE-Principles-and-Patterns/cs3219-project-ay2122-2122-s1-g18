const { assert } = require('console')

const waitingUsers = new Map()
const userMatchingPreferences = new Map()

exports.createEventListeners = (socket, io) => {
  socket.on('find-match', (matchBy) => {
    userMatchingPreferences.set(socket.id, matchBy)

    if (!waitingUsers.has(matchBy)) {
      waitingUsers.set(matchBy, socket.id)
      return
    }

    // Use waiting user's socket id as room id
    const codingRoomId = waitingUsers.get(matchBy)
    socket.join(codingRoomId)
    io.to(codingRoomId).emit('match-found', codingRoomId)
    waitingUsers.delete(matchBy)
  })

  socket.on('end-wait', (matchBy) => {
    assert(waitingUsers.has(matchBy))
    assert(waitingUsers.get(matchBy) === socket.id)
    waitingUsers.delete(matchBy)
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
      waitingUsers.delete(matchBy)
      userMatchingPreferences.delete(socket.id)
    }
  })
}
