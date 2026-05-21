import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

type StatCardProps = {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  loading?: boolean
  variant?: 'default' | 'warning' | 'success'
}

const variantStyles = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-amber-500/10 text-amber-600',
  success: 'bg-emerald-500/10 text-emerald-600',
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
  variant = 'default',
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start gap-4 p-5">
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-lg',
            variantStyles[variant]
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
          )}
          {description && !loading && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
