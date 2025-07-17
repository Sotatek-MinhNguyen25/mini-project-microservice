export const getAccessToken = () => {
  return localStorage.getItem('accessToken')
}

export const getAuthorizationHeader = () => ({
  Authorization: `${getAccessToken()}`,
})