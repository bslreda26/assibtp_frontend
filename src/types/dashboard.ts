export type DashboardStats = {
  totalGrues: number
  gruesEnLocation: number
  gruesEnEntretien: number
  locationsEnCours: number
  stockAlerts: number
  revenueMois: number
}

export type FleetBreakdownItem = {
  statut: 'DISPONIBLE' | 'EN_LOCATION' | 'EN_ENTRETIEN' | 'HORS_SERVICE'
  label: string
  value: number
  color: string
}
