import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { usePermissions } from '@/hooks/usePermissions'
import { getApiErrorMessage } from '@/lib/api'
import * as gruesService from '@/services/grues.service'
import type { Grue, GruePayload, GrueStatut } from '@/types/grue'

const STATUTS: GrueStatut[] = ['DISPONIBLE', 'EN_LOCATION', 'EN_ENTRETIEN', 'HORS_SERVICE']

export function GruesPage() {
  const queryClient = useQueryClient()
  const { canManageGrues } = usePermissions()
  const [searchParams, setSearchParams] = useSearchParams()
  const disponiblesOnly = searchParams.get('disponibles') === 'true'
  const [page, setPage] = useState(1)
  const [statutFilter, setStatutFilter] = useState<GrueStatut | ''>(
    disponiblesOnly ? 'DISPONIBLE' : ''
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Grue | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<GruePayload>({
    nom: '',
    modele: '',
    numeroSerie: '',
    statut: 'DISPONIBLE',
    capaciteTonnes: null,
    annee: null,
    notes: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['grues', { page, statut: statutFilter }],
    queryFn: () =>
      gruesService.listGrues({
        page,
        limit: 20,
        statut: statutFilter || undefined,
      }),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: GruePayload) =>
      editing ? gruesService.updateGrue(editing.id, payload) : gruesService.createGrue(payload),
    onSuccess: () => {
      toast.success(editing ? 'Grue mise à jour' : 'Grue créée')
      void queryClient.invalidateQueries({ queryKey: ['grues'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDialogOpen(false)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: gruesService.deleteGrue,
    onSuccess: () => {
      toast.success('Grue supprimée')
      void queryClient.invalidateQueries({ queryKey: ['grues'] })
      setDeleteId(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ nom: '', modele: '', numeroSerie: '', statut: 'DISPONIBLE', capaciteTonnes: null, annee: null, notes: '' })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grues"
        description="Flotte de grues et statuts opérationnels."
        action={
          canManageGrues ? (
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Nouvelle grue
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant={statutFilter === 'DISPONIBLE' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setStatutFilter('DISPONIBLE')
            setSearchParams({ disponibles: 'true' })
            setPage(1)
          }}
        >
          Disponibles
        </Button>
        <Button
          variant={statutFilter === '' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setStatutFilter('')
            setSearchParams({})
            setPage(1)
          }}
        >
          Toutes
        </Button>
        {STATUTS.filter((s) => s !== 'DISPONIBLE').map((s) => (
          <Button
            key={s}
            variant={statutFilter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatutFilter(s)
              setSearchParams({})
              setPage(1)
            }}
          >
            <StatusBadge statut={s} />
          </Button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton cols={5} />
      ) : !data?.data.length ? (
        <EmptyState icon={Truck} title="Aucune grue" />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Modèle</TableHead>
                  <TableHead>N° série</TableHead>
                  <TableHead>Statut</TableHead>
                  {canManageGrues && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((grue) => (
                  <TableRow key={grue.id}>
                    <TableCell className="font-medium">
                      <Link to={`/grues/${grue.id}`} className="text-primary hover:underline">
                        {grue.nom}
                      </Link>
                    </TableCell>
                    <TableCell>{grue.modele}</TableCell>
                    <TableCell>{grue.numeroSerie}</TableCell>
                    <TableCell><StatusBadge statut={grue.statut} /></TableCell>
                    {canManageGrues && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(grue); setForm({ nom: grue.nom, modele: grue.modele, numeroSerie: grue.numeroSerie, statut: grue.statut, capaciteTonnes: grue.capaciteTonnes, annee: grue.annee, notes: grue.notes ?? '' }); setDialogOpen(true) }}>
                          Modifier
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(grue.id)}>Supprimer</Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      {canManageGrues && (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{editing ? 'Modifier la grue' : 'Nouvelle grue'}</DialogTitle></DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2"><Label>Nom *</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
                <div className="space-y-2"><Label>Modèle *</Label><Input value={form.modele} onChange={(e) => setForm({ ...form, modele: e.target.value })} /></div>
                <div className="space-y-2"><Label>N° série *</Label><Input value={form.numeroSerie} onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Statut</Label>
                  <Select value={form.statut} onValueChange={(v) => setForm({ ...form, statut: v as GrueStatut })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Capacité (t)</Label><Input type="number" value={form.capaciteTonnes ?? ''} onChange={(e) => setForm({ ...form, capaciteTonnes: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className="space-y-2"><Label>Année</Label><Input type="number" value={form.annee ?? ''} onChange={(e) => setForm({ ...form, annee: e.target.value ? Number(e.target.value) : null })} /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Notes</Label><Input value={form.notes ?? ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button disabled={!form.nom || !form.modele || !form.numeroSerie || saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} title="Supprimer la grue" description="Impossible si location ou entretien en cours." confirmLabel="Supprimer" variant="destructive" loading={deleteMutation.isPending} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
        </>
      )}
    </div>
  )
}
