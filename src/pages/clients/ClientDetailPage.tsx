import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatFcfa, formatLocationPeriod, numberValue } from '@/lib/format'
import * as clientsService from '@/services/clients.service'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const clientId = Number(id)

  const { data: client, isLoading } = useQuery({
    queryKey: ['clients', clientId],
    queryFn: () => clientsService.getClient(clientId),
    enabled: !Number.isNaN(clientId),
  })

  if (isLoading) return <TableSkeleton cols={3} />

  if (!client) return <p>Client introuvable</p>

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.nom}
        description="Fiche client et historique des locations."
        action={
          <Button variant="outline" asChild>
            <Link to="/clients">
              <ArrowLeft className="size-4" />
              Retour
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informations</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-muted-foreground">Téléphone</p>
            <p className="font-medium">{client.telephone ?? '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">E-mail</p>
            <p className="font-medium">{client.email ?? '—'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">Adresse</p>
            <p className="font-medium">{client.adresse ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des locations</CardTitle>
        </CardHeader>
        <CardContent>
          {!client.locations?.length ? (
            <p className="text-sm text-muted-foreground">Aucune location enregistrée.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grue</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Prix/jour</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>
                      <Link to={`/locations/${loc.id}`} className="text-primary hover:underline">
                        {loc.grue?.nom ?? `Grue #${loc.grueId}`}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {formatLocationPeriod(loc)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge statut={loc.statut} />
                    </TableCell>
                    <TableCell>{formatFcfa(numberValue(loc.prixParJour))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
