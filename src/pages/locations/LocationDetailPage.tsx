import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getApiErrorMessage } from '@/lib/api'
import { formatDate, formatFcfa, numberValue } from '@/lib/format'
import * as locationsService from '@/services/locations.service'
import { useState } from 'react'

export function LocationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const locationId = Number(id)
  const queryClient = useQueryClient()
  const [confirmTerminer, setConfirmTerminer] = useState(false)

  const { data: location, isLoading } = useQuery({
    queryKey: ['locations', locationId],
    queryFn: () => locationsService.getLocation(locationId),
    enabled: !Number.isNaN(locationId),
  })

  const { data: factureData } = useQuery({
    queryKey: ['locations', locationId, 'facture'],
    queryFn: () => locationsService.getLocationFacture(locationId),
    enabled: !Number.isNaN(locationId),
  })

  const terminerMutation = useMutation({
    mutationFn: () => locationsService.terminerLocation(locationId),
    onSuccess: () => {
      toast.success('Location terminée')
      void queryClient.invalidateQueries({ queryKey: ['locations'] })
      void queryClient.invalidateQueries({ queryKey: ['grues'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setConfirmTerminer(false)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  if (isLoading) return <TableSkeleton cols={3} />
  if (!location) return <p>Location introuvable</p>

  const facture = factureData?.facture

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Location #${location.id}`}
        description={`${location.client?.nom} — ${location.grue?.nom}`}
        action={
          <div className="flex gap-2">
            {location.statut === 'EN_COURS' && (
              <Button onClick={() => setConfirmTerminer(true)}>Terminer</Button>
            )}
            <Button variant="outline" asChild>
              <Link to="/locations"><ArrowLeft className="size-4" />Retour</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Détails</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Statut</span><StatusBadge statut={location.statut} /></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sortie</span><span>{formatDate(location.dateSortie)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Fin</span><span>{formatDate(location.dateFin)}</span></div>
            {location.dateProvisoire && (
              <div className="flex justify-between"><span className="text-muted-foreground">Provisoire</span><span>{formatDate(location.dateProvisoire)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-muted-foreground">Prix/jour</span><span>{formatFcfa(numberValue(location.prixParJour))}</span></div>
            {location.notes && <div><p className="text-muted-foreground">Notes</p><p>{location.notes}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Facture</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {facture ? (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Jours facturés</span><span className="font-semibold">{facture.jours}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Prix/jour</span><span>{formatFcfa(facture.prixParJour)}</span></div>
                <div className="flex justify-between border-t pt-3 text-base">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-primary">{formatFcfa(facture.total)}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Chargement…</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmTerminer}
        onOpenChange={setConfirmTerminer}
        title="Terminer la location"
        description="La grue redeviendra disponible. Cette action est définitive."
        confirmLabel="Terminer"
        loading={terminerMutation.isPending}
        onConfirm={() => terminerMutation.mutate()}
      />
    </div>
  )
}
