import { Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_NAME, APP_TAGLINE } from '@/lib/brand'

type AppBrandProps = {
  variant?: 'default' | 'sidebar' | 'compact'
  className?: string
}

export function AppBrand({ variant = 'default', className }: AppBrandProps) {
  const isSidebar = variant === 'sidebar'
  const isCompact = variant === 'compact'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex shrink-0 items-center justify-center rounded-lg',
          isSidebar ? 'size-10 bg-primary text-primary-foreground' : 'size-12 bg-primary text-primary-foreground',
          isCompact && 'size-9'
        )}
      >
        <Truck className={cn(isCompact ? 'size-5' : 'size-6')} />
      </div>
      <div className="min-w-0">
        {isSidebar ? (
          <>
            <p className="truncate text-lg font-bold tracking-tight text-primary">{APP_NAME}</p>
            <p className="truncate text-xs text-sidebar-foreground/70">{APP_TAGLINE}</p>
          </>
        ) : (
          <>
            <p className={cn('font-bold tracking-tight text-foreground', isCompact ? 'text-base' : 'text-xl')}>
              {APP_NAME}
            </p>
            <p className={cn('text-muted-foreground', isCompact ? 'text-xs' : 'text-sm')}>{APP_TAGLINE}</p>
          </>
        )}
      </div>
    </div>
  )
}
