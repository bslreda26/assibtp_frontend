import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type StockAlertBannerProps = {
  count: number
}

export function StockAlertBanner({ count }: StockAlertBannerProps) {
  if (count <= 0) return null

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/50 bg-primary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-medium text-foreground">
            {count === 1
              ? '1 pièce sous le seuil minimum'
              : `${count} pièces sous le seuil minimum`}
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Réapprovisionnez le stock pour éviter les ruptures pendant les entretiens.
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="shrink-0 border-primary/50 bg-card hover:bg-primary/15" asChild>
        <Link to="/stock?alerte=true">
          Voir les alertes
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  )
}
