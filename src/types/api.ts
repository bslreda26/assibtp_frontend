export type UserRole = 'ADMIN' | 'TECHNICIEN'

export type ApiSuccess<T> = { success: true; data: T }

export type ApiError = {
  success: false
  error: string
  details?: unknown
}

export type PaginatedMeta = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
}

export type Paginated<T> = {
  meta: PaginatedMeta
  data: T[]
}

export type User = {
  id: number
  nom: string
  email: string
  role: UserRole
}

export type AuthData = {
  user: User
  token: string
}
