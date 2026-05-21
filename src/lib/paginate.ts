import type { Paginated, PaginatedMeta } from '@/types/api'

export type LucidPaginator<T> = {
  meta: PaginatedMeta
  data: T[]
}

export function unwrapPaginated<T>(payload: LucidPaginator<T>): Paginated<T> {
  return { meta: payload.meta, data: payload.data }
}
