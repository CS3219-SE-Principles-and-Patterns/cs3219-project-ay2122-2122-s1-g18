const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')
const routes = require('./src/routes')

const app = express()
const port = process.env.PORT || 8000

app.use(express.urlencoded({
  extended: true
}))
app.use(express.json())
app.use(cors())

// realtime stuff
const path = require('path')
app.use(express.static(path.join(__dirname, 'dist')))
app.use('/rooms', express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  res.json({
    status: 'healthy'
  })
})

app.use('/api', routes)

app.listen(port, () => {
  console.log('Running on port', port)
})

dotenv.config()
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true })

module.exports = app
