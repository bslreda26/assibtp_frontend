import { api } from '@/lib/api'
import type { ApiSuccess, AuthData, User } from '@/types/api'

export type LoginPayload = {
  email: string
  password: string
}

export type SignupPayload = {
  nom: string
  email: string
  password: string
  passwordConfirmation: string
}

export async function login(payload: LoginPayload): Promise<AuthData> {
  const { data } = await api.post<ApiSuccess<AuthData>>('/auth/login', payload)
  return data.data
}

export async function signup(payload: SignupPayload): Promise<AuthData> {
  const { data } = await api.post<ApiSuccess<AuthData>>('/auth/signup', payload)
  return data.data
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<ApiSuccess<User>>('/auth/me')
  return data.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
