const PRODUCTION_SERVER = 'https://shrek-tech.herokuapp.com'
// const PRODUCTION_SOCKET = 'ws://shrek-tech.herokuapp.com'

export const SERVER_URI = process.env.NODE_ENV === 'production'
  ? PRODUCTION_SERVER
  : 'http://localhost:8000'

export const SOCKET_URI = process.env.NODE_ENV === 'production'
  ? ''
  : 'http://localhost:4000'
