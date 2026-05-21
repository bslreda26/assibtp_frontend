import { api } from '@/lib/api'
import { unwrapPaginated, type LucidPaginator } from '@/lib/paginate'
import type { ApiSuccess, Paginated } from '@/types/api'
import type {
  EntretienExterne,
  EntretienExternePayload,
  EntretienStatut,
} from '@/types/entretien'

export async function listEntretienExterne(params: {
  page?: number
  limit?: number
  statut?: EntretienStatut
}): Promise<Paginated<EntretienExterne>> {
  const { data } = await api.get<ApiSuccess<LucidPaginator<EntretienExterne>>>(
    '/entretien-externe',
    { params }
  )
  return unwrapPaginated(data.data)
}

export async function getEntretienExterne(id: number): Promise<EntretienExterne> {
  const { data } = await api.get<ApiSuccess<EntretienExterne>>(`/entretien-externe/${id}`)
  return data.data
}

export async function createEntretienExterne(
  payload: EntretienExternePayload
): Promise<EntretienExterne> {
  const { data } = await api.post<ApiSuccess<EntretienExterne>>('/entretien-externe', payload)
  return data.data
}

export async function terminerEntretienExterne(id: number): Promise<EntretienExterne> {
  const { data } = await api.patch<ApiSuccess<EntretienExterne>>(
    `/entretien-externe/${id}/terminer`
  )
  return data.data
}

export async function deleteEntretienExterne(id: number): Promise<void> {
  await api.delete(`/entretien-externe/${id}`)
}
