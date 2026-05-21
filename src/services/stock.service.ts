import { api } from '@/lib/api'
import { listBody, postList } from '@/lib/paginate'
import type { ApiSuccess, Paginated } from '@/types/api'
import type { StockPayload, StockPiece } from '@/types/stock'

export async function listStock(params: {
  page?: number
  limit?: number
  nom?: string
  alerte?: boolean
}): Promise<Paginated<StockPiece>> {
  const body = listBody({
    page: params.page,
    limit: params.limit,
    nom: params.nom,
    ...(params.alerte ? { alerte: true } : {}),
  })
  return postList<StockPiece>('/stock', body)
}

export async function getStockPiece(id: number): Promise<StockPiece> {
  const { data } = await api.get<ApiSuccess<StockPiece>>(`/stock/${id}`)
  return data.data
}

export async function createStockPiece(payload: StockPayload): Promise<StockPiece> {
  const { data } = await api.post<ApiSuccess<StockPiece>>('/stock/create', payload)
  return data.data
}

export async function updateStockPiece(
  id: number,
  payload: Partial<StockPayload>
): Promise<StockPiece> {
  const { data } = await api.put<ApiSuccess<StockPiece>>(`/stock/${id}`, payload)
  return data.data
}

export async function ajusterStock(id: number, delta: number): Promise<StockPiece> {
  const { data } = await api.patch<ApiSuccess<StockPiece>>(`/stock/${id}/ajuster`, { delta })
  return data.data
}
