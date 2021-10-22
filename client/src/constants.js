const PRODUCTION_SERVER = 'https://cs3219-project-ay2122-s1-g18.as.r.appspot.com'

export const SERVER_URI = process.env.NODE_ENV === 'production'
  ? PRODUCTION_SERVER
  : 'http://localhost:8000'

export const SOCKET_URI = process.env.NODE_ENV === 'production'
  ? PRODUCTION_SERVER
  : 'http://localhost:4000'
