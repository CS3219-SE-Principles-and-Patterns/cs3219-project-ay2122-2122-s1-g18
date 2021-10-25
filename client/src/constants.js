const DEV_SERVER_URI = 'http://localhost:8000'
const PRODUCTION_SERVER_URI = 'https://shrektech.herokuapp.com'

export const SERVER_URI = process.env.NODE_ENV === 'production'
  ? PRODUCTION_SERVER_URI
  : DEV_SERVER_URI
