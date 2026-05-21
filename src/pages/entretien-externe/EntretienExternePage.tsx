import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Wrench } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate, formatFcfa, numberValue } from '@/lib/format'
import * as entretienExterneService from '@/services/entretien-externe.service'

export function EntretienExternePage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['entretien-externe', { page }],
    queryFn: () => entretienExterneService.listEntretienExterne({ page, limit: 20 }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entretien externe"
        description="Entretiens réalisés par des fournisseurs externes."
        action={<Button asChild><Link to="/entretien-externe/new"><Plus className="size-4" />Nouvel entretien</Link></Button>}
      />
      {isLoading ? <TableSkeleton cols={5} /> : !data?.data.length ? (
        <EmptyState icon={Wrench} title="Aucun entretien externe" />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grue</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Coût total</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell><Link to={`/entretien-externe/${e.id}`} className="font-medium text-primary hover:underline">{e.grue?.nom}</Link></TableCell>
                    <TableCell>{e.fournisseur?.nom ?? '—'}</TableCell>
                    <TableCell>{formatDate(e.dateEntretien)}</TableCell>
                    <TableCell>{formatFcfa(numberValue(e.coutTotal))}</TableCell>
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
