export type StockPiece = {
  id: number
  nom: string
  reference: string
  quantiteDisponible: number
  seuilMinimum: number
  prixUnitaire: number | string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export type StockPayload = {
  nom: string
  reference: string
  quantiteDisponible?: number
  prixUnitaire: number
  seuilMinimum?: number
  description?: string | null
}
