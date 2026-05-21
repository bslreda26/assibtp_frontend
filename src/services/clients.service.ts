import { api } from '@/lib/api'
import { listBody, postList } from '@/lib/paginate'
import type { ApiSuccess, Paginated } from '@/types/api'
import type { Client, ClientPayload } from '@/types/client'

export async function listClients(params: {
  page?: number
  limit?: number
  nom?: string
}): Promise<Paginated<Client>> {
  return postList<Client>('/clients', listBody(params))
}

export async function getClient(id: number): Promise<Client> {
  const { data } = await api.get<ApiSuccess<Client>>(`/clients/${id}`)
  return data.data
}

export async function createClient(payload: ClientPayload): Promise<Client> {
  const { data } = await api.post<ApiSuccess<Client>>('/clients/create', payload)
  return data.data
}

export async function updateClient(id: number, payload: Partial<ClientPayload>): Promise<Client> {
  const { data } = await api.put<ApiSuccess<Client>>(`/clients/${id}`, payload)
  return data.data
}

export async function deleteClient(id: number): Promise<void> {
  await api.delete(`/clients/${id}`)
}
