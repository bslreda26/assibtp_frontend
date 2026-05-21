import { api } from '@/lib/api'
import { listBody, postList } from '@/lib/paginate'
import type { ApiSuccess, Paginated } from '@/types/api'
import type { Fournisseur, FournisseurPayload } from '@/types/fournisseur'

export async function listFournisseurs(params: {
  page?: number
  limit?: number
  nom?: string
}): Promise<Paginated<Fournisseur>> {
  return postList<Fournisseur>('/fournisseurs', listBody(params))
}

export async function getFournisseur(id: number): Promise<Fournisseur> {
  const { data } = await api.get<ApiSuccess<Fournisseur>>(`/fournisseurs/${id}`)
  return data.data
}

export async function createFournisseur(payload: FournisseurPayload): Promise<Fournisseur> {
  const { data } = await api.post<ApiSuccess<Fournisseur>>('/fournisseurs/create', payload)
  return data.data
}

export async function updateFournisseur(
  id: number,
  payload: Partial<FournisseurPayload>
): Promise<Fournisseur> {
  const { data } = await api.put<ApiSuccess<Fournisseur>>(`/fournisseurs/${id}`, payload)
  return data.data
}

export async function deleteFournisseur(id: number): Promise<void> {
  await api.delete(`/fournisseurs/${id}`)
}
