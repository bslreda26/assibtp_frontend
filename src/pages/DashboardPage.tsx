import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Banknote,
  ClipboardList,
  Truck,
  Wrench,
} from 'lucide-react'
import { FleetStatusChart } from '@/components/dashboard/FleetStatusChart'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { StockAlertBanner } from '@/components/dashboard/StockAlertBanner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api'
import { formatFcfa } from '@/lib/format'
import * as dashboardService from '@/services/dashboard.service'

export function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getDashboardStats,
  })

  const fleetQuery = useQuery({
    queryKey: ['dashboard', 'fleet-breakdown'],
    queryFn: dashboardService.getFleetBreakdown,
  })

  const loading = statsQuery.isLoading
  const stats = statsQuery.data
  const error = statsQuery.isError ? getApiErrorMessage(statsQuery.error) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de la flotte, des locations et du stock."
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
          <Button
            variant="outline"
            size="sm"
            className="ml-3"
            onClick={() => void statsQuery.refetch()}
          >
            Réessayer
          </Button>
        </div>
      )}

      {stats && <StockAlertBanner count={stats.stockAlerts} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total grues"
          value={String(stats?.totalGrues ?? 0)}
          icon={Truck}
          loading={loading}
        />
        <StatCard
          title="En location"
          value={String(stats?.gruesEnLocation ?? 0)}
          icon={ClipboardList}
          loading={loading}
          variant="default"
        />
        <StatCard
          title="En entretien"
          value={String(stats?.gruesEnEntretien ?? 0)}
          icon={Wrench}
          loading={loading}
          variant="warning"
        />
        <StatCard
          title="Locations en cours"
          value={String(stats?.locationsEnCours ?? 0)}
          icon={ClipboardList}
          loading={loading}
        />
        <StatCard
          title="Alertes stock"
          value={String(stats?.stockAlerts ?? 0)}
          icon={AlertTriangle}
          loading={loading}
          variant={stats && stats.stockAlerts > 0 ? 'warning' : 'default'}
          description={
            stats && stats.stockAlerts > 0 ? 'Pièces sous le seuil' : undefined
          }
        />
        <StatCard
          title="Revenu du mois"
          value={stats ? formatFcfa(stats.revenueMois) : '—'}
          icon={Banknote}
          loading={loading}
          variant="success"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FleetStatusChart
            data={fleetQuery.data ?? []}
            loading={fleetQuery.isLoading}
          />
        </div>
        <QuickActions />
      </div>
    </div>
  )
}
