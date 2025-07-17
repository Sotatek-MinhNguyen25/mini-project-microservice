import { AxiosResponse } from 'axios'
import { get, post, put, deleteReq, upload } from '../lib/axiosClient'
import { getAuthorizationHeader } from '../utils/auth'

const postService = {
  getPosts: async (page = 1, limit = 10) => {
    const response: AxiosResponse = await get(`/posts?page=${page}&limit=${limit}`)
    return response.data
  },
  
  createPost: async (postData: any) => {
    const response: AxiosResponse = await post('/posts', postData, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  updatePost: async (id: string, data: any) => {
    const response: AxiosResponse = await put(`/posts/${id}`, data, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  deletePost: async (id: string) => {
    const response: AxiosResponse = await deleteReq(`/posts/${id}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  addReaction: async (postId: string, type: string) => {
    const response: AxiosResponse = await post(
      `/posts/${postId}/reactions`,
      { type },
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  createComment: async (postId: string, content: string, parentId?: string) => {
    const response: AxiosResponse = await post(
      `/posts/${postId}/comments`,
      { content, parentId },
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  updateComment: async (postId: string, commentId: string, content: string) => {
    const response: AxiosResponse = await put(
      `/posts/${postId}/comments/${commentId}`,
      { content },
      {
        headers: getAuthorizationHeader(),
      }
    )
    return response.data
  },

  deleteComment: async (postId: string, commentId: string) => {
    const response: AxiosResponse = await deleteReq(`/posts/${postId}/comments/${commentId}`, {
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
    const response: AxiosResponse = await get(`/posts/${postId}`, {
      headers: getAuthorizationHeader(),
    })
    return response.data
  },

  uploadSingleFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response: AxiosResponse = await post('/files/upload', formData, {
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

    const response: AxiosResponse = await upload('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthorizationHeader(),
      },
    })
    return response.data
  }
}

export default postService
