export default function authHeader () {
  const accessToken = JSON.parse(sessionStorage.getItem('user')).token
  if (accessToken) {
    return { Authorization: 'Bearer ' + accessToken }
  } else {
    return {}
  }
}
