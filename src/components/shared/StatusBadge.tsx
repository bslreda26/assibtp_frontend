import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATUT_STYLES: Record<string, string> = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  EN_LOCATION: 'bg-blue-100 text-blue-800 border-blue-200',
  EN_ENTRETIEN: 'bg-primary/20 text-foreground border-primary/50',
  HORS_SERVICE: 'bg-red-100 text-red-800 border-red-200',
  EN_COURS: 'bg-blue-100 text-blue-800 border-blue-200',
  TERMINEE: 'bg-slate-100 text-slate-700 border-slate-200',
  TERMINE: 'bg-slate-100 text-slate-700 border-slate-200',
  ANNULEE: 'bg-red-50 text-red-700 border-red-200',
  ANNULE: 'bg-red-50 text-red-700 border-red-200',
}

const STATUT_LABELS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  EN_LOCATION: 'En location',
  EN_ENTRETIEN: 'En entretien',
  HORS_SERVICE: 'Hors service',
  EN_COURS: 'En cours',
  TERMINEE: 'Terminée',
  TERMINE: 'Terminé',
  ANNULEE: 'Annulée',
  ANNULE: 'Annulé',
}

type StatusBadgeProps = {
  statut: string
  className?: string
}

export function StatusBadge({ statut, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', STATUT_STYLES[statut] ?? '', className)}
    >
      {STATUT_LABELS[statut] ?? statut}
    </Badge>
  )
}
