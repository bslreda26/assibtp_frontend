import { api } from '@/lib/api'
import { listBody, postList } from '@/lib/paginate'
import type { ApiSuccess, Paginated } from '@/types/api'
import type {
  EntretienLocal,
  EntretienLocalPayload,
  EntretienStatut,
} from '@/types/entretien'

export async function listEntretienLocal(params: {
  page?: number
  limit?: number
  grueId?: number
  grueNom?: string
  statut?: EntretienStatut
}): Promise<Paginated<EntretienLocal>> {
  return postList<EntretienLocal>('/entretien-local', listBody(params))
}

export async function getEntretienLocal(id: number): Promise<EntretienLocal> {
  const { data } = await api.get<ApiSuccess<EntretienLocal>>(`/entretien-local/${id}`)
  return data.data
}

export async function createEntretienLocal(
  payload: EntretienLocalPayload
): Promise<EntretienLocal> {
  const { data } = await api.post<ApiSuccess<EntretienLocal>>('/entretien-local/create', payload)
  return data.data
}

export async function terminerEntretienLocal(id: number): Promise<EntretienLocal> {
  const { data } = await api.patch<ApiSuccess<EntretienLocal>>(
    `/entretien-local/${id}/terminer`
  )
  return data.data
}

export async function deleteEntretienLocal(id: number): Promise<void> {
  await api.delete(`/entretien-local/${id}`)
}
