import { AxiosResponse } from 'axios'
import { get, post, put, deleteReq, upload } from '../lib/axiosClient'
import { getAuthorizationHeader } from '../utils/auth'

const PostPrefix = '/post'
const UploadPrefix = '/upload'

const postService = {
  getPosts: async (page = 1, limit = 10) => {
    const response: AxiosResponse = await get(`${PostPrefix}?page=${page}&limit=${limit}`)
    return response.data
  },
  
  createPost: async (postData: any) => {
    const response: AxiosResponse = await post(`${PostPrefix}`, postData, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  updatePost: async (id: string, data: any) => {
    const response: AxiosResponse = await put(`${PostPrefix}/${id}`, data, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  deletePost: async (id: string) => {
    const response: AxiosResponse = await deleteReq(`${PostPrefix}/${id}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  addReaction: async (postId: string, type: string) => {
    const response: AxiosResponse = await post(
      `${PostPrefix}/${postId}/reactions`,
      { type },
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  createComment: async (postId: string, content: string, parentId?: string) => {
    const response: AxiosResponse = await post(
      `${PostPrefix}/${postId}/comments`,
      { content, parentId },
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  updateComment: async (postId: string, commentId: string, content: string) => {
    const response: AxiosResponse = await put(
      `${PostPrefix}/${postId}/comments/${commentId}`,
      { content },
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  deleteComment: async (postId: string, commentId: string) => {
    const response: AxiosResponse = await deleteReq(`${PostPrefix}/${postId}/comments/${commentId}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  getPostsByUser: async (userId: string, page = 1, limit = 10) => {
    const response: AxiosResponse = await get(`/users/${userId}/posts?page=${page}&limit=${limit}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  getPostById: async (postId: string) => {
    const response: AxiosResponse = await get(`${PostPrefix}/${postId}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  uploadSingleFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response: AxiosResponse = await post(`${UploadPrefix}/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthorizationHeader(),
      },
    })
    return response.data
  },

  uploadMultipleFiles: async (files: File[]) => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    const response: AxiosResponse = await upload(`${UploadPrefix}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthorizationHeader(),
      },
    })
    return response.data
  }
}

export default postService
