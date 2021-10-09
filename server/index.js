const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')

// realtime chat stuff
var path = require('path');
var room = require('./src/routes/room');
var chat = require('./src/routes/chat');

const routes = require('./src/routes')
const userRoutes = require('./src/routes/users')

const app = express()
const port = process.env.PORT || 8000

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())
app.use(cors())

app.use(express.static(path.join(__dirname, 'dist')));
app.use('/rooms', express.static(path.join(__dirname, 'dist')));
app.use('/api/room', room);
app.use('/api/chat', chat);

app.get('/', (req, res) => {
  res.json({
    status: 'healthy'
  })
})

app.use('/api', routes)
app.use('/api/user', userRoutes)

app.listen(port, () => {
  console.log('Running on port', port)
})

dotenv.config()
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

module.exports = app
