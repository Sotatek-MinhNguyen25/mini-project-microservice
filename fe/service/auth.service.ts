import { AxiosResponse } from 'axios'
import { get, post, put, deleteReq } from '../lib/axiosClient'
import { getAuthorizationHeader } from '../utils/auth'
import { RegisterData } from '@/types/auth'
import { send } from 'process'

const authService = {
  getUserProfile: async (userId: string) => {
    const response: AxiosResponse = await get(`/users/${userId}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  login: async (email: string, password: string) => {
    const response: AxiosResponse = await post('/auth/login', { email, password })
    return response.data
  },

  register: async (data: RegisterData) => {
    const response: AxiosResponse = await post('/auth/register', data)
    return response.data
  },

  logout: async () => {
    const response: AxiosResponse = await post(
      '/auth/logout',
      {},
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  resetPassword: async (email: string) => {
    const response: AxiosResponse = await post('/auth/reset-password', { email })
    return response.data
  },

  sendVerificationEmail: async (email: string) => {
    const response: AxiosResponse = await post('/auth/send-register-otp', { email })
    return response.data
  },

  verifyOTP: async (email: string, otp: string) => {
    const response: AxiosResponse = await post('/auth/verify-otp', { email, otp })
    return response.data
  },

  me: async () => {
    const response: AxiosResponse = await get('/users/profile/me', {
      headers: getAuthorizationHeader(),
    })
    return response.data
  }
}

export default authService
