import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ExportEntretienPdfButton } from '@/components/shared/ExportEntretienPdfButton'
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
import { getApiErrorMessage } from '@/lib/api'
import { exportEntretienExternePdf } from '@/lib/entretien-pdf'
import { formatDate, formatFcfa, numberValue } from '@/lib/format'
import * as entretienExterneService from '@/services/entretien-externe.service'

function ligneTotal(quantite: number, prixUnitaire: number | string) {
  return quantite * numberValue(prixUnitaire)
}

export function EntretienExterneDetailPage() {
  const { id } = useParams<{ id: string }>()
  const entretienId = Number(id)
  const queryClient = useQueryClient()
  const [confirmTerminer, setConfirmTerminer] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: e, isLoading } = useQuery({
    queryKey: ['entretien-externe', entretienId],
    queryFn: () => entretienExterneService.getEntretienExterne(entretienId),
    enabled: !Number.isNaN(entretienId),
  })

  const terminerMutation = useMutation({
    mutationFn: () => entretienExterneService.terminerEntretienExterne(entretienId),
    onSuccess: () => {
      toast.success('Entretien terminé')
      void queryClient.invalidateQueries({ queryKey: ['entretien-externe'] })
      void queryClient.invalidateQueries({ queryKey: ['grues'] })
      setConfirmTerminer(false)
      if (e) exportEntretienExternePdf({ ...e, statut: 'TERMINE' })
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => entretienExterneService.deleteEntretienExterne(entretienId),
    onSuccess: () => {
      toast.success('Entretien supprimé')
      window.location.href = '/entretien-externe'
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  if (isLoading) return <TableSkeleton cols={3} />
  if (!e) return <p>Entretien introuvable</p>

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Entretien externe #${e.id}`}
        description={e.grue?.nom}
        action={
          <div className="flex gap-2">
            {e.statut === 'EN_COURS' && (
              <>
                <Button onClick={() => setConfirmTerminer(true)}>Terminer</Button>
                <Button variant="destructive" onClick={() => setConfirmDelete(true)}>Supprimer</Button>
              </>
            )}
            <ExportEntretienPdfButton type="externe" entretien={e} />
            <Button variant="outline" asChild><Link to="/entretien-externe"><ArrowLeft className="size-4" />Retour</Link></Button>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap gap-6 pt-6 text-sm">
          <div><p className="text-muted-foreground">Statut</p><StatusBadge statut={e.statut} /></div>
          <div><p className="text-muted-foreground">Date</p><p>{formatDate(e.dateEntretien)}</p></div>
          <div><p className="text-muted-foreground">Fournisseur</p><p>{e.fournisseur?.nom ?? '—'}</p></div>
          <div><p className="text-muted-foreground">Coût total</p><p className="text-lg font-bold text-primary">{formatFcfa(numberValue(e.coutTotal))}</p></div>
          {e.description && <div className="w-full"><p className="text-muted-foreground">Description</p><p>{e.description}</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Lignes — prestations</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Qté</TableHead>
                <TableHead>Prix unit.</TableHead>
                <TableHead>Sous-total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {e.lignes?.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{l.descriptionPiece}</TableCell>
                  <TableCell>{l.quantite}</TableCell>
                  <TableCell>{formatFcfa(numberValue(l.prixUnitaire))}</TableCell>
                  <TableCell>{formatFcfa(ligneTotal(l.quantite, l.prixUnitaire))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmTerminer}
        onOpenChange={setConfirmTerminer}
        title="Terminer l'entretien"
        description="Marquer cet entretien comme terminé et télécharger le bon PDF."
        confirmLabel="Terminer"
        loading={terminerMutation.isPending}
        onConfirm={() => terminerMutation.mutate()}
      />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer"
        description="Action irréversible."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  )
}
