// API utility functions for future integration

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    })
  }

  // User endpoints
  async getProfile() {
    return this.request("/users/profile")
  }

  async updateProfile(data: any) {
    return this.request("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Post endpoints
  async getPosts(page = 1, limit = 10) {
    return this.request(`/posts?page=${page}&limit=${limit}`)
  }

  async createPost(postData: any) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify(postData),
    })
  }

  async updatePost(id: string, postData: any) {
    return this.request(`/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(postData),
    })
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, {
      method: "DELETE",
    })
  }

  // Comment endpoints
  async getComments(postId: string) {
    return this.request(`/posts/${postId}/comments`)
  }

  async createComment(postId: string, content: string, parentId?: string) {
    return this.request(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content, parentId }),
    })
  }

  // Reaction endpoints
  async addReaction(postId: string, type: string) {
    return this.request(`/posts/${postId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ type }),
    })
  }

  async removeReaction(postId: string) {
    return this.request(`/posts/${postId}/reactions`, {
      method: "DELETE",
    })
  }

  // File upload
  async uploadFile(file: File) {
    const formData = new FormData()
    formData.append("file", file)

    const headers: HeadersInit = {}
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
