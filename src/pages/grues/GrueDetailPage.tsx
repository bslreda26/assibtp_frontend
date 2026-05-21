import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import * as gruesService from '@/services/grues.service'

export function GrueDetailPage() {
  const { id } = useParams<{ id: string }>()
  const grueId = Number(id)

  const { data: grue, isLoading } = useQuery({
    queryKey: ['grues', grueId],
    queryFn: () => gruesService.getGrue(grueId),
    enabled: !Number.isNaN(grueId),
  })

  if (isLoading) return <TableSkeleton cols={3} />
  if (!grue) return <p>Grue introuvable</p>

  return (
    <div className="space-y-6">
      <PageHeader
        title={grue.nom}
        description={`${grue.modele} — ${grue.numeroSerie}`}
        action={
          <Button variant="outline" asChild>
            <Link to="/grues"><ArrowLeft className="size-4" />Retour</Link>
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap gap-6 pt-6 text-sm">
          <div><p className="text-muted-foreground">Statut</p><StatusBadge statut={grue.statut} /></div>
          <div><p className="text-muted-foreground">Capacité</p><p className="font-medium">{grue.capaciteTonnes ? `${grue.capaciteTonnes} t` : '—'}</p></div>
          <div><p className="text-muted-foreground">Année</p><p className="font-medium">{grue.annee ?? '—'}</p></div>
          {grue.notes && <div className="w-full"><p className="text-muted-foreground">Notes</p><p>{grue.notes}</p></div>}
        </CardContent>
      </Card>

      <Tabs defaultValue="locations">
        <TabsList>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="entretiens">Entretiens</TabsTrigger>
        </TabsList>
        <TabsContent value="locations">
          <Card>
            <CardHeader><CardTitle className="text-base">Locations</CardTitle></CardHeader>
            <CardContent>
              {!grue.locations?.length ? (
                <p className="text-sm text-muted-foreground">Aucune location.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {grue.locations.map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell>
                          <Link to={`/locations/${loc.id}`} className="text-primary hover:underline">
                            {loc.client?.nom ?? `Client #${loc.clientId}`}
                          </Link>
                        </TableCell>
                        <TableCell>{formatDate(loc.dateSortie)} → {formatDate(loc.dateFin)}</TableCell>
                        <TableCell><StatusBadge statut={loc.statut} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="entretiens">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Entretien local</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {grue.entretienLocaux?.length ? grue.entretienLocaux.map((e) => (
                  <Link key={e.id} to={`/entretien-local/${e.id}`} className="block text-primary hover:underline">
                    {formatDate(e.dateEntretien)} — <StatusBadge statut={e.statut} />
                  </Link>
                )) : <p className="text-muted-foreground">Aucun</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Entretien externe</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {grue.entretienExternes?.length ? grue.entretienExternes.map((e) => (
                  <Link key={e.id} to={`/entretien-externe/${e.id}`} className="block text-primary hover:underline">
                    {formatDate(e.dateEntretien)} — <StatusBadge statut={e.statut} />
                  </Link>
                )) : <p className="text-muted-foreground">Aucun</p>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
