import type { Location } from '@/types/location'
import type { EntretienLocal, EntretienExterne } from '@/types/entretien'

export type GrueStatut =
  | 'DISPONIBLE'
  | 'EN_LOCATION'
  | 'EN_ENTRETIEN'
  | 'HORS_SERVICE'

export type Grue = {
  id: number
  nom: string
  modele: string
  numeroSerie: string
  statut: GrueStatut
  capaciteTonnes?: number | null
  annee?: number | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
  locations?: Location[]
  entretienLocaux?: EntretienLocal[]
  entretienExternes?: EntretienExterne[]
}

export type GruePayload = {
  nom: string
  modele: string
  numeroSerie: string
  statut?: GrueStatut
  capaciteTonnes?: number | null
  annee?: number | null
  notes?: string | null
}
