export type Fournisseur = {
  id: number
  nom: string
  telephone?: string | null
  email?: string | null
  adresse?: string | null
  typeFourniture?: string | null
  createdAt?: string
  updatedAt?: string
}

export type FournisseurPayload = {
  nom: string
  telephone?: string | null
  email?: string | null
  adresse?: string | null
  typeFourniture?: string | null
}
