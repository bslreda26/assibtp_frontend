import { format, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatFcfa(amount: number): string {
  const rounded = Math.round(amount)
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${formatted} FCFA`
}

export function formatDate(
  value: string | Date | null | undefined,
  pattern = 'dd MMM yyyy'
): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? parseISO(value) : value
  if (!isValid(date)) return '—'
  return format(date, pattern, { locale: fr })
}

export function formatDateTime(value: string | Date | null | undefined): string {
  return formatDate(value, 'dd MMM yyyy HH:mm')
}

export function toApiDate(value: Date): string {
  return value.toISOString()
}

/** Vine `date()` expects `YYYY-MM-DD` or `YYYY-MM-DD HH:mm:ss`, not ISO strings. */
export function toApiDateFromInput(dateStr: string): string {
  if (!dateStr) return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
  return `${dateStr} 00:00:00`
}

export function formatLocationPeriod(location: {
  dateSortie: string
  dateFin?: string | null
  dateProvisoire?: string | null
}): string {
  if (location.dateFin) {
    return `${formatDate(location.dateSortie)} → ${formatDate(location.dateFin)}`
  }
  if (location.dateProvisoire) {
    return `${formatDate(location.dateSortie)} → prov. ${formatDate(location.dateProvisoire)}`
  }
  return `${formatDate(location.dateSortie)} → en cours`
}

export function numberValue(value: number | string | null | undefined): number {
  if (value == null) return 0
  return typeof value === 'string' ? Number(value) : value
}
