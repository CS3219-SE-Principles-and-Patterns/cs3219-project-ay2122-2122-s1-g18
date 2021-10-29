const { assert } = require('console')
const codingQuestionsController = require('./codingQuestionsController')
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

async function getCodingQuestionIdx (matchBy) {
  const result = await codingQuestionsController.getCodingQuestionsIdx(matchBy)
  const result2 = Math.floor(Math.random() * (result))
  return result2
}

exports.createEventListeners = (socket, io) => {
  socket.on('join-waiting-users-listener', () => {
    socket.join('waiting-users-listener')
    socket.emit('update-waiting-users', waitingUsers)
  })
  socket.on('find-match', async (matchBy) => {
    if (!waitingUsers[matchBy]) {
      userMatchingPreferences.set(socket.id, matchBy)
      addWaitingUser(matchBy, socket)
      return
    }

    const codingQuestionIdx1 = await getCodingQuestionIdx(matchBy)
    let codingQuestionIdx2 = await getCodingQuestionIdx(matchBy)
    while (codingQuestionIdx2 === codingQuestionIdx1) {
      codingQuestionIdx2 = await getCodingQuestionIdx(matchBy)
    }

    const waitingUserMatched = waitingUsers[matchBy]
    // Use waiting user's socket id as room id
    const codingRoomInfo = {
      id: `${waitingUserMatched}-${socket.id}`,
      interviewer: randSelectInterviewer(socket.id, waitingUserMatched),
      codingQuestionIdx: codingQuestionIdx1,
      codingQuestionIdx2: codingQuestionIdx2
    }
    socket.join(codingRoomInfo.id)
    socket.to(waitingUserMatched).emit('match-found', codingRoomInfo)
    removeWaitingUser(matchBy, io)
  })

  socket.on('join-room', (roomInfo) => {
    socket.join(roomInfo.id)
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

  socket.on('send-chat', (chat) => {
    if (chat.isPrivate) {
      socket.emit('new-chat', chat)
    } else {
      io.to(chat.room).emit('new-chat', chat)
    }
  })

  socket.on('update-code', (codeUpdate) => {
    socket.to(codeUpdate.room).emit('new-code', codeUpdate.codeChanges)
  })

  socket.on('load-next-question', (room) => io.to(room).emit('next-question'))

  socket.on('disconnect', () => {
    if (userMatchingPreferences.has(socket.id)) {
      const matchBy = userMatchingPreferences.get(socket.id)
      removeWaitingUser(matchBy, io)
      userMatchingPreferences.delete(socket.id)
    }
  })
}
