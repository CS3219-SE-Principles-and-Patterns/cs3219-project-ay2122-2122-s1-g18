const { assert } = require('console')

const waitingUsers = []
const userPreferences = new Map()

exports.createEventListeners = (socket, io) => {
  socket.on('find-match', (matchBy) => {
    userPreferences.set(socket.id, matchBy)

    if (!waitingUsers[matchBy]) {
      waitingUsers[matchBy] = socket.id
      return
    }

    // Use waiting user's socket id as room id
    const codingRoomId = waitingUsers[matchBy]
    socket.join(codingRoomId)
    io.to(codingRoomId).emit('match-found', codingRoomId)
    waitingUsers[matchBy] = null
  })

  socket.on('end-wait', (matchBy) => {
    assert(waitingUsers[matchBy] === socket.id)
    if (waitingUsers[matchBy] === socket.id) {
      waitingUsers[matchBy] = null
      userPreferences.delete(socket.id)
    }
  })

  socket.on('send-chat', (chat) => {
    io.to(chat.room).emit('new-chat', chat)
  })

  socket.on('update-code', (codeUpdate) => {
    io.to(codeUpdate.room).emit('new-code', codeUpdate.code)
  })

  socket.on('disconnect', () => {
    const matchBy = userPreferences.get(socket.id)
    waitingUsers[matchBy] = null
    userPreferences.delete(socket.id)
  })
}
