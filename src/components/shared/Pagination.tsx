import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaginatedMeta } from '@/types/api'

type PaginationProps = {
  meta: PaginatedMeta
  onPageChange: (page: number) => void
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.lastPage <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="text-sm text-muted-foreground">
        Page {meta.currentPage} sur {meta.lastPage} — {meta.total} résultat
        {meta.total > 1 ? 's' : ''}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.currentPage <= 1}
          onClick={() => onPageChange(meta.currentPage - 1)}
        >
          <ChevronLeft className="size-4" />
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={meta.currentPage >= meta.lastPage}
          onClick={() => onPageChange(meta.currentPage + 1)}
        >
          Suivant
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
