import { api } from '@/lib/api'
import { unwrapPaginated, type LucidPaginator } from '@/lib/paginate'
import type { ApiSuccess, Paginated } from '@/types/api'
import type { FactureData, Location, LocationPayload, LocationStatut } from '@/types/location'

export async function listLocations(params: {
  page?: number
  limit?: number
  statut?: LocationStatut
}): Promise<Paginated<Location>> {
  const { data } = await api.get<ApiSuccess<LucidPaginator<Location>>>('/locations', { params })
  return unwrapPaginated(data.data)
}

export async function getLocation(id: number): Promise<Location> {
  const { data } = await api.get<ApiSuccess<Location>>(`/locations/${id}`)
  return data.data
}

export async function createLocation(payload: LocationPayload): Promise<Location> {
  const { data } = await api.post<ApiSuccess<Location>>('/locations', payload)
  return data.data
}

export async function updateLocation(
  id: number,
  payload: Partial<LocationPayload>
): Promise<Location> {
  const { data } = await api.put<ApiSuccess<Location>>(`/locations/${id}`, payload)
  return data.data
}

export async function terminerLocation(id: number): Promise<Location> {
  const { data } = await api.patch<ApiSuccess<Location>>(`/locations/${id}/terminer`)
  return data.data
}

export async function getLocationFacture(id: number): Promise<{
  location: Location
  facture: FactureData
}> {
  const { data } = await api.get<
    ApiSuccess<{ location: Location; facture: FactureData }>
  >(`/locations/${id}/facture`)
  return data.data
}
