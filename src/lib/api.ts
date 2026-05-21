import axios from 'axios'
import type { ApiError } from '@/types/api'

export const TOKEN_KEY = 'gruebtp_token'
export const USER_KEY = 'gruebtp_user'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const d = error.response.data as ApiError
    if (d.details && Array.isArray(d.details)) {
      const msgs = d.details
        .map((item) => {
          if (item && typeof item === 'object' && 'message' in item) {
            return String((item as { message: string }).message)
          }
          return null
        })
        .filter(Boolean)
      if (msgs.length > 0) return msgs.join(' — ')
    }
    return d.error ?? 'Une erreur est survenue'
  }
  return 'Une erreur est survenue'
}
