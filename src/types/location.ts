export type LocationStatut = 'EN_COURS' | 'TERMINEE' | 'ANNULEE'

export type Location = {
  id: number
  clientId: number
  grueId: number
  dateSortie: string
  dateFin: string | null
  dateProvisoire?: string | null
  prixParJour: number | string
  statut: LocationStatut
  notes?: string | null
  client?: { id: number; nom: string; email?: string | null; telephone?: string | null }
  grue?: { id: number; nom: string; modele?: string }
  createdAt?: string
  updatedAt?: string
}

export type LocationPayload = {
  clientId: number
  grueId: number
  dateSortie: string
  dateFin?: string | null
  dateProvisoire?: string | null
  prixParJour: number
  notes?: string | null
}

export type FactureData = {
  jours: number
  prixParJour: number
  total: number
}
