import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Users } from 'lucide-react'
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
import * as clientsService from '@/services/clients.service'
import type { Client, ClientPayload } from '@/types/client'

export function ClientsPage() {
  const queryClient = useQueryClient()
  const { canDeleteClients } = usePermissions()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [form, setForm] = useState<ClientPayload>({ nom: '', telephone: '', email: '', adresse: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['clients', { page, search: debouncedSearch }],
    queryFn: () => clientsService.listClients({ page, limit: 20, search: debouncedSearch || undefined }),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: ClientPayload) =>
      editing ? clientsService.updateClient(editing.id, payload) : clientsService.createClient(payload),
    onSuccess: () => {
      toast.success(editing ? 'Client mis à jour' : 'Client créé')
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
      setDialogOpen(false)
      setEditing(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsService.deleteClient(id),
    onSuccess: () => {
      toast.success('Client supprimé')
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
      setDeleteId(null)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const openCreate = () => {
    setEditing(null)
    setForm({ nom: '', telephone: '', email: '', adresse: '' })
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
    setForm({
      nom: client.nom,
      telephone: client.telephone ?? '',
      email: client.email ?? '',
      adresse: client.adresse ?? '',
    })
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients"
        description="Gestion des clients et historique des locations."
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nouveau client
          </Button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Rechercher par nom ou e-mail…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      {isLoading ? (
        <TableSkeleton cols={4} />
      ) : !data?.data.length ? (
        <EmptyState icon={Users} title="Aucun client" description="Créez votre premier client." action={<Button onClick={openCreate}>Nouveau client</Button>} />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link to={`/clients/${client.id}`} className="text-primary hover:underline">
                        {client.nom}
                      </Link>
                    </TableCell>
                    <TableCell>{client.telephone ?? '—'}</TableCell>
                    <TableCell>{client.email ?? '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(client)}>
                        Modifier
                      </Button>
                      {canDeleteClients && (
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(client.id)}>
                          Supprimer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.meta && <Pagination meta={data.meta} onPageChange={setPage} />}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={form.telephone ?? ''} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input value={form.adresse ?? ''} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button
              disabled={!form.nom.trim() || saveMutation.isPending}
              onClick={() => saveMutation.mutate(form)}
            >
              {saveMutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Supprimer le client"
        description="Cette action est irréversible. Les locations actives empêchent la suppression."
        confirmLabel="Supprimer"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
      />
    </div>
  )
}
