import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const baseURL = 'http://127.0.0.1:3002/'
const api = '/api'

const defaultHeaders = {
  'Content-Type': 'application/json',
}

const axiosClient = axios.create({
  baseURL,
  responseType: 'json',
  timeout: 10000,
})

const defaultConfig = async (): Promise<AxiosRequestConfig> => {
  return {
    headers: defaultHeaders,
  }
}

const mergeConfig = async (config?: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  const _defaultConfig = await defaultConfig()
  let headers = _defaultConfig.headers

  if (config && config.headers) {
    headers = {
      ...headers,
      ...config.headers,
    }
  }

  return {
    ..._defaultConfig,
    ...config,
    headers,
  }
}

axiosClient.interceptors.request.use(
  (config) => {
    // Attach token if exists
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig

    if (error.response) {
      const { status } = error.response

      // Handle Unauthorized (401) errors
      if (originalRequest && status === 401 && !originalRequest._retry) {
        originalRequest._retry = true
      }

      // Handle Forbidden (403) errors
      if (status === 403) {
        // Call logout API
        setTimeout(async () => {
          try {
            await axios.post(`${baseURL}${api}/login`, null, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
            })
          } catch (error) {
            /* empty */
          }

          // Clear tokens and redirect to log in
          localStorage.removeItem('accessToken')
          localStorage.removeItem('profile')

          window.location.href = '/'
        }, 2000)
      }

      // Handle server errors (5xx)
      if (status >= 500) {
        /* empty */
      }
    }

    return Promise.reject(error)
  }
)

export const get = async (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  const _mergeConfig = await mergeConfig(config)

  return axiosClient
    .get(url, _mergeConfig)
    .then((res) => res.data)
    .catch((err) => err.response)
}

export const post = async <T>(url: string, data: T, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  const _mergeConfig = await mergeConfig(config)

  return axiosClient
    .post(url, data, _mergeConfig)
    .then((res) => res)
    .catch((err) => err.response)
}

export const put = async <T>(url: string, data: T, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  const _mergeConfig = await mergeConfig(config)

  return axiosClient
    .put(url, data, _mergeConfig)
    .then((res) => res)
    .catch((err) => err.response)
}

export const patch = async <T>(url: string, data: T, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  const _mergeConfig = await mergeConfig(config)

  return axiosClient
    .patch(url, data, _mergeConfig)
    .then((res) => res)
    .catch((err) => err.response)
}

export const deleteReq = async (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  const _mergeConfig = await mergeConfig(config)

  return axiosClient
    .delete(url, _mergeConfig)
    .then((res) => res)
    .catch((err) => err.response)
}

export const upload = async (url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
  // Merge custom config with multipart headers
  const _mergeConfig = {
    ...(await mergeConfig(config)),
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data',
    },
  }

  return axiosClient
    .post(url, formData, _mergeConfig)
    .then((res) => res)
    .catch((err) => err.response)
}

export default axiosClient
