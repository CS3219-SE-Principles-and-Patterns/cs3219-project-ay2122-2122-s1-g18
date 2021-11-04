import axios from 'axios'
import { SERVER_URI } from '../constants'

const AXIOS = axios.create({
  baseURL: SERVER_URI
})

export default AXIOS

export function getAuthHeader () {
  try {
    const accessToken = JSON.parse(sessionStorage.getItem('token'))
    if (accessToken) {
      return { Authorization: 'Bearer ' + accessToken }
    }
    return {}
  } catch (_err) {
    return {}
  }
}
