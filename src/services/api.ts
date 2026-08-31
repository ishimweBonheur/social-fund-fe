import axios, { AxiosError } from 'axios'
import { authStorage } from '@/services/authStorage'

export interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data: T
}
export interface ApiErrorBody {
  error?: { code?: string; message?: string }
}

export const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, ''),
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && authStorage.getToken()) {
      authStorage.clear()
      window.dispatchEvent(new Event('social-fund:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Unable to complete the request.') {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const code = error.response?.data?.error?.code
    const message = error.response?.data?.error?.message
    if (code && message) return `${code}: ${message}`
    if (code) return code
    if (message) return message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}
