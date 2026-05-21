import { api } from '@/lib/api'
import type { ApiSuccess } from '@/types/api'
import type { DashboardStats, FleetBreakdownItem } from '@/types/dashboard'
import type { Grue } from '@/types/grue'

const FLEET_COLORS: Record<FleetBreakdownItem['statut'], string> = {
  DISPONIBLE: '#22c55e',
  EN_LOCATION: '#3b82f6',
  EN_ENTRETIEN: '#FFC107',
  HORS_SERVICE: '#ef4444',
}

const FLEET_LABELS: Record<FleetBreakdownItem['statut'], string> = {
  DISPONIBLE: 'Disponible',
  EN_LOCATION: 'En location',
  EN_ENTRETIEN: 'En entretien',
  HORS_SERVICE: 'Hors service',
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<ApiSuccess<DashboardStats>>('/dashboard/stats')
  return data.data
}

export async function getFleetBreakdown(): Promise<FleetBreakdownItem[]> {
  const [stats, disponiblesRes] = await Promise.all([
    getDashboardStats(),
    api.get<ApiSuccess<Grue[]>>('/grues/disponibles'),
  ])

  const disponible = disponiblesRes.data.data.length
  const enLocation = stats.gruesEnLocation
  const enEntretien = stats.gruesEnEntretien
  const horsService = Math.max(
    0,
    stats.totalGrues - disponible - enLocation - enEntretien
  )

  const items: FleetBreakdownItem[] = [
    { statut: 'DISPONIBLE', label: FLEET_LABELS.DISPONIBLE, value: disponible, color: FLEET_COLORS.DISPONIBLE },
    { statut: 'EN_LOCATION', label: FLEET_LABELS.EN_LOCATION, value: enLocation, color: FLEET_COLORS.EN_LOCATION },
    { statut: 'EN_ENTRETIEN', label: FLEET_LABELS.EN_ENTRETIEN, value: enEntretien, color: FLEET_COLORS.EN_ENTRETIEN },
    { statut: 'HORS_SERVICE', label: FLEET_LABELS.HORS_SERVICE, value: horsService, color: FLEET_COLORS.HORS_SERVICE },
  ]

  return items.filter((item) => item.value > 0)
}
