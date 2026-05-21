import { api } from '@/lib/api'
import { listBody, postList } from '@/lib/paginate'
import type { ApiSuccess, Paginated } from '@/types/api'
import type { Grue, GruePayload, GrueStatut } from '@/types/grue'

export async function listGrues(params: {
  page?: number
  limit?: number
  nom?: string
  statut?: GrueStatut
}): Promise<Paginated<Grue>> {
  return postList<Grue>('/grues', listBody(params))
}

export async function getGruesDisponibles(): Promise<Grue[]> {
  const { data } = await api.get<ApiSuccess<Grue[]>>('/grues/disponibles')
  return data.data
}

export async function getGrue(id: number): Promise<Grue> {
  const { data } = await api.get<ApiSuccess<Grue>>(`/grues/${id}`)
  return data.data
}

export async function createGrue(payload: GruePayload): Promise<Grue> {
  const { data } = await api.post<ApiSuccess<Grue>>('/grues/create', payload)
  return data.data
}

export async function updateGrue(id: number, payload: Partial<GruePayload>): Promise<Grue> {
  const { data } = await api.put<ApiSuccess<Grue>>(`/grues/${id}`, payload)
  return data.data
}

export async function deleteGrue(id: number): Promise<void> {
  await api.delete(`/grues/${id}`)
}
