export default function authHeader () {
  const accessToken = JSON.parse(sessionStorage.getItem('token'))
  if (accessToken) {
    return { Authorization: 'Bearer ' + accessToken }
  } else {
    return {}
  }
}
