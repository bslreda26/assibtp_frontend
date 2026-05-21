import { api } from '@/lib/api'
import type { ApiSuccess, User, UserRole } from '@/types/api'

export type CreateUserPayload = {
  nom: string
  email: string
  password: string
  role: UserRole
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await api.post<ApiSuccess<User>>('/users', payload)
  return data.data
}
