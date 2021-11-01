import axios from 'axios'
import { SERVER_URI } from '../constants'

const AXIOS = axios.create({
  baseURL: SERVER_URI
})

export default AXIOS

export function getAuthHeader () {
  const accessToken = JSON.parse(sessionStorage.getItem('token'))
  if (accessToken) {
    return { Authorization: 'Bearer ' + accessToken }
  } else {
    return {}
  }
}
