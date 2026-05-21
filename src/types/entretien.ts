import type { Grue } from '@/types/grue'
import type { Fournisseur } from '@/types/fournisseur'
import type { StockPiece } from '@/types/stock'

export type EntretienStatut = 'EN_COURS' | 'TERMINE' | 'ANNULE'

export type LigneEntretienLocal = {
  id: number
  entretienId: number
  pieceId: number
  quantite: number
  piece?: StockPiece
}

export type EntretienLocal = {
  id: number
  grueId: number
  dateEntretien: string
  description?: string | null
  technicien?: string | null
  statut: EntretienStatut
  grue?: Pick<Grue, 'id' | 'nom' | 'statut'>
  lignes?: LigneEntretienLocal[]
  createdAt?: string
  updatedAt?: string
}

export type LigneEntretienExterne = {
  id: number
  entretienId: number
  descriptionPiece: string
  quantite: number
  prixUnitaire: number | string
}

export type EntretienExterne = {
  id: number
  grueId: number
  fournisseurId: number
  dateEntretien: string
  description?: string | null
  statut: EntretienStatut
  coutTotal: number | string
  grue?: Pick<Grue, 'id' | 'nom'>
  fournisseur?: Pick<Fournisseur, 'id' | 'nom'>
  lignes?: LigneEntretienExterne[]
  createdAt?: string
  updatedAt?: string
}

export type EntretienLocalPayload = {
  grueId: number
  dateEntretien: string
  description?: string | null
  technicien?: string | null
  lignes: { pieceId: number; quantite: number }[]
}

export type EntretienExternePayload = {
  grueId: number
  fournisseurId: number
  dateEntretien: string
  description?: string | null
  lignes: { descriptionPiece: string; quantite: number; prixUnitaire: number }[]
}
