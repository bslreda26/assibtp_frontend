import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { Pagination } from '@/components/shared/Pagination'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDebounce } from '@/hooks/useDebounce'
import { usePermissions } from '@/hooks/usePermissions'
import { getApiErrorMessage } from '@/lib/api'
import * as fournisseursService from '@/services/fournisseurs.service'
import type { Fournisseur, FournisseurPayload } from '@/types/fournisseur'

export function FournisseursPage() {
  const queryClient = useQueryClient()
  const { canManageFournisseurs } = usePermissions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Fournisseur | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<FournisseurPayload>({ nom: '', telephone: '', email: '', adresse: '', typeFourniture: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['fournisseurs', { page, nom: debouncedSearch }],
    queryFn: () =>
      fournisseursService.listFournisseurs({
        page,
        limit: 20,
        nom: debouncedSearch || undefined,
      }),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: FournisseurPayload) =>
      editing ? fournisseursService.updateFournisseur(editing.id, payload) : fournisseursService.createFournisseur(payload),
    onSuccess: () => {
      toast.success(editing ? 'Fournisseur mis à jour' : 'Fournisseur créé')
      void queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      setDialogOpen(false)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: fournisseursService.deleteFournisseur,
    onSuccess: () => {
      toast.success('Fournisseur supprimé')
      void queryClient.invalidateQueries({ queryKey: ['fournisseurs'] })
      setDeleteId(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fournisseurs"
        description={canManageFournisseurs ? 'Gestion des fournisseurs externes.' : 'Consultation des fournisseurs (lecture seule).'}
        action={canManageFournisseurs ? <Button onClick={() => { setEditing(null); setForm({ nom: '', telephone: '', email: '', adresse: '', typeFourniture: '' }); setDialogOpen(true) }}><Plus className="size-4" />Nouveau</Button> : undefined}
      />

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher par nom…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {isLoading ? <TableSkeleton cols={4} /> : !data?.data.length ? (
        <EmptyState icon={Building2} title="Aucun fournisseur" />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Type</TableHead>
                  {canManageFournisseurs && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      <Link to={`/fournisseurs/${f.id}`} className="text-primary hover:underline">{f.nom}</Link>
                    </TableCell>
                    <TableCell>{f.telephone ?? '—'}</TableCell>
                    <TableCell>{f.typeFourniture ?? '—'}</TableCell>
                    {canManageFournisseurs && (
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(f); setForm({ nom: f.nom, telephone: f.telephone ?? '', email: f.email ?? '', adresse: f.adresse ?? '', typeFourniture: f.typeFourniture ?? '' }); setDialogOpen(true) }}>Modifier</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(f.id)}>Supprimer</Button>
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

      {canManageFournisseurs && (
        <>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Nouveau fournisseur'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nom *</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
                <div className="space-y-2"><Label>Téléphone</Label><Input value={form.telephone ?? ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
                <div className="space-y-2"><Label>E-mail</Label><Input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                <div className="space-y-2"><Label>Type fourniture</Label><Input value={form.typeFourniture ?? ''} onChange={(e) => setForm({ ...form, typeFourniture: e.target.value })} /></div>
                <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse ?? ''} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button disabled={!form.nom || saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <ConfirmDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)} title="Supprimer" description="Supprimer ce fournisseur ?" confirmLabel="Supprimer" variant="destructive" loading={deleteMutation.isPending} onConfirm={() => deleteId && deleteMutation.mutate(deleteId)} />
        </>
      )}
    </div>
  )
}
