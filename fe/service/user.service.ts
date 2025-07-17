import { AxiosResponse } from 'axios'
import { get, post, put, deleteReq } from '../lib/axiosClient'
import { getAuthorizationHeader } from '../utils/auth'

const userService = {
  getUserProfile: async (userId: string) => {
    const response: AxiosResponse = await get(`/users/${userId}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  updateUserProfile: async (userId: string, data: any) => {
    const response: AxiosResponse = await put(`/users/${userId}`, data, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  deleteUserProfile: async (userId: string) => {
    const response: AxiosResponse = await deleteReq(`/users/${userId}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  followUser: async (userId: string) => {
    const response: AxiosResponse = await post(
      `/users/${userId}/follow`,
      {},
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  unfollowUser: async (userId: string) => {
    const response: AxiosResponse = await deleteReq(`/users/${userId}/follow`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  getFollowers: async (userId: string, page = 1, limit = 10) => {
    const response: AxiosResponse = await get(`/users/${userId}/followers?page=${page}&limit=${limit}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },
}

export default userService
