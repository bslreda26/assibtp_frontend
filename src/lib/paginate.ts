import { api } from '@/lib/api'
import type { ApiSuccess, Paginated, PaginatedMeta } from '@/types/api'

export type LucidPaginator<T> = {
  meta: PaginatedMeta
  data: T[]
}

export function unwrapPaginated<T>(payload: LucidPaginator<T>): Paginated<T> {
  return { meta: payload.meta, data: payload.data }
}

export function listBody(
  params: { page?: number; limit?: number } & Record<string, unknown>
): Record<string, unknown> {
  const { page, limit, ...filters } = params
  const body: Record<string, unknown> = {
    page: page ?? 1,
    limit: limit ?? 20,
  }
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      body[key] = value
    }
  }
  return body
}

export async function postList<T>(
  path: string,
  body: Record<string, unknown>
): Promise<Paginated<T>> {
  const { data } = await api.post<ApiSuccess<LucidPaginator<T>>>(path, body)
  return unwrapPaginated(data.data)
}
