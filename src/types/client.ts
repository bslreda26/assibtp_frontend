import type { Location } from '@/types/location'

export type Client = {
  id: number
  nom: string
  telephone?: string | null
  email?: string | null
  adresse?: string | null
  createdAt?: string
  updatedAt?: string
  locations?: Location[]
}

export type ClientPayload = {
  nom: string
  telephone?: string | null
  email?: string | null
  adresse?: string | null
}
