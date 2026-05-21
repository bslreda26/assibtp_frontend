import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/format'
import * as entretienLocalService from '@/services/entretien-local.service'

export function EntretienLocalPage() {
  const [page, setPage] = useState(1)
  const [grueSearch, setGrueSearch] = useState('')
  const debouncedGrueSearch = useDebounce(grueSearch)

  const { data, isLoading } = useQuery({
    queryKey: ['entretien-local', { page, grueNom: debouncedGrueSearch }],
    queryFn: () =>
      entretienLocalService.listEntretienLocal({
        page,
        limit: 20,
        grueNom: debouncedGrueSearch || undefined,
      }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entretien local"
        description="Entretiens atelier avec pièces du stock."
        action={<Button asChild><Link to="/entretien-local/new"><Plus className="size-4" />Nouvel entretien</Link></Button>}
      />

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher par grue…"
          value={grueSearch}
          onChange={(e) => {
            setGrueSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {isLoading ? <TableSkeleton cols={5} /> : !data?.data.length ? (
        <EmptyState icon={Wrench} title="Aucun entretien" action={<Button asChild><Link to="/entretien-local/new">Créer</Link></Button>} />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Technicien</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <Link to={`/entretien-local/${e.id}`} className="font-medium text-primary hover:underline">
                        {e.grue?.nom ?? `#${e.grueId}`}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(e.dateEntretien)}</TableCell>
                    <TableCell>{e.technicien ?? '—'}</TableCell>
                    <TableCell><StatusBadge statut={e.statut} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}
    </div>
  )
}
