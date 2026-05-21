import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'
import { formatFcfa, formatLocationPeriod, numberValue } from '@/lib/format'
import * as locationsService from '@/services/locations.service'
import type { LocationStatut } from '@/types/location'

export function LocationsPage() {
  const [page, setPage] = useState(1)
  const [clientSearch, setClientSearch] = useState('')
  const debouncedClientSearch = useDebounce(clientSearch)
  const [statut, setStatut] = useState<LocationStatut | ''>('')

  const { data, isLoading } = useQuery({
    queryKey: ['locations', { page, statut, clientNom: debouncedClientSearch }],
    queryFn: () =>
      locationsService.listLocations({
        page,
        limit: 20,
        clientNom: debouncedClientSearch || undefined,
        statut: statut || undefined,
      }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations"
        description="Gestion des locations de grues."
        action={
          <Button asChild>
            <Link to="/locations/new"><Plus className="size-4" />Nouvelle location</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Rechercher par client…"
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>
        <Select
          value={statut || 'ALL'}
          onValueChange={(v) => {
            setStatut(v === 'ALL' ? '' : (v as LocationStatut))
            setPage(1)
          }}
        >
          <SelectTrigger className="w-48"><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="EN_COURS">En cours</SelectItem>
            <SelectItem value="TERMINEE">Terminée</SelectItem>
            <SelectItem value="ANNULEE">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} />
      ) : !data?.data.length ? (
        <EmptyState title="Aucune location" action={<Button asChild><Link to="/locations/new">Nouvelle location</Link></Button>} />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Grue</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix/jour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell className="font-medium">
                      <Link to={`/locations/${loc.id}`} className="text-primary hover:underline">
                        {loc.client?.nom ?? `#${loc.clientId}`}
                      </Link>
                    </TableCell>
                    <TableCell>{loc.grue?.nom ?? `#${loc.grueId}`}</TableCell>
                    <TableCell>{formatLocationPeriod(loc)}</TableCell>
                    <TableCell><StatusBadge statut={loc.statut} /></TableCell>
                    <TableCell>{formatFcfa(numberValue(loc.prixParJour))}</TableCell>
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
