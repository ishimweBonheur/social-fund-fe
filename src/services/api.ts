import axios, { AxiosError } from 'axios'
import { authStorage } from '@/services/authStorage'

export interface ApiEnvelope<T> { success?: boolean; message?: string; data: T }

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
  }
)

export function getApiErrorMessage(error: unknown, fallback = 'Unable to complete the request.') {
  if (axios.isAxiosError<{ message?: string }>(error)) return error.response?.data?.message || error.message || fallback
  return error instanceof Error ? error.message : fallback
}
