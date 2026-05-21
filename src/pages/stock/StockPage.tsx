import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Package, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
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
import { formatFcfa, numberValue } from '@/lib/format'
import * as stockService from '@/services/stock.service'
import type { StockPayload, StockPiece } from '@/types/stock'
import { cn } from '@/lib/utils'

export function StockPage() {
  const queryClient = useQueryClient()
  const { canManageStockCatalogue } = usePermissions()
  const [searchParams, setSearchParams] = useSearchParams()
  const alerteOnly = searchParams.get('alerte') === 'true'
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [ajusterPiece, setAjusterPiece] = useState<StockPiece | null>(null)
  const [delta, setDelta] = useState('')
  const [editing, setEditing] = useState<StockPiece | null>(null)
  const [form, setForm] = useState<StockPayload>({
    nom: '',
    reference: '',
    quantiteDisponible: 0,
    prixUnitaire: 0,
    seuilMinimum: 5,
    description: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['stock', { page, alerte: alerteOnly, nom: debouncedSearch }],
    queryFn: () =>
      stockService.listStock({
        page,
        limit: 20,
        nom: debouncedSearch || undefined,
        alerte: alerteOnly,
      }),
  })

  const saveMutation = useMutation({
    mutationFn: (payload: StockPayload) =>
      editing ? stockService.updateStockPiece(editing.id, payload) : stockService.createStockPiece(payload),
    onSuccess: () => {
      toast.success(editing ? 'Pièce mise à jour' : 'Pièce créée')
      void queryClient.invalidateQueries({ queryKey: ['stock'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDialogOpen(false)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const ajusterMutation = useMutation({
    mutationFn: ({ id, delta: d }: { id: number; delta: number }) => stockService.ajusterStock(id, d),
    onSuccess: () => {
      toast.success('Stock ajusté')
      void queryClient.invalidateQueries({ queryKey: ['stock'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setAjusterPiece(null)
      setDelta('')
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const isAlert = (p: StockPiece) => p.quantiteDisponible < p.seuilMinimum

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock pièces"
        description="Catalogue et ajustements de stock."
        action={
          canManageStockCatalogue ? (
            <Button onClick={() => { setEditing(null); setForm({ nom: '', reference: '', quantiteDisponible: 0, prixUnitaire: 0, seuilMinimum: 5, description: '' }); setDialogOpen(true) }}>
              <Plus className="size-4" />Ajouter
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
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
        <div className="flex gap-2">
          <Button
            variant={alerteOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSearchParams({ alerte: 'true' })
              setPage(1)
            }}
          >
            <AlertTriangle className="size-4" />
            Alertes uniquement
          </Button>
          <Button
            variant={!alerteOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSearchParams({})
              setPage(1)
            }}
          >
            Tout le stock
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton cols={6} />
      ) : !data?.data.length ? (
        <EmptyState icon={Package} title="Aucune pièce" />
      ) : (
        <>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Référence</TableHead>
                  <TableHead>Quantité</TableHead>
                  <TableHead>Seuil</TableHead>
                  <TableHead>Prix unitaire</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((piece) => (
                  <TableRow key={piece.id} className={cn(isAlert(piece) && 'bg-primary/10')}>
                    <TableCell className="font-medium">{piece.nom}</TableCell>
                    <TableCell>{piece.reference}</TableCell>
                    <TableCell>
                      <span className={cn(isAlert(piece) && 'font-semibold text-foreground')}>
                        {piece.quantiteDisponible}
                        {isAlert(piece) && <AlertTriangle className="ml-1 inline size-3" />}
                      </span>
                    </TableCell>
                    <TableCell>{piece.seuilMinimum}</TableCell>
                    <TableCell>{formatFcfa(numberValue(piece.prixUnitaire))}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => { setAjusterPiece(piece); setDelta('') }}>Ajuster</Button>
                      {canManageStockCatalogue && (
                        <Button variant="ghost" size="sm" onClick={() => { setEditing(piece); setForm({ nom: piece.nom, reference: piece.reference, quantiteDisponible: piece.quantiteDisponible, prixUnitaire: numberValue(piece.prixUnitaire), seuilMinimum: piece.seuilMinimum, description: piece.description ?? '' }); setDialogOpen(true) }}>Modifier</Button>
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
          <DialogHeader><DialogTitle>{editing ? 'Modifier' : 'Nouvelle pièce'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2"><Label>Nom *</Label><Input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
            <div className="space-y-2"><Label>Référence *</Label><Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div>
            <div className="space-y-2"><Label>Prix unitaire *</Label><Input type="number" value={form.prixUnitaire} onChange={(e) => setForm({ ...form, prixUnitaire: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Quantité</Label><Input type="number" value={form.quantiteDisponible} onChange={(e) => setForm({ ...form, quantiteDisponible: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Seuil minimum</Label><Input type="number" value={form.seuilMinimum} onChange={(e) => setForm({ ...form, seuilMinimum: Number(e.target.value) })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(form)}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!ajusterPiece} onOpenChange={(o) => !o && setAjusterPiece(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajuster — {ajusterPiece?.nom}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Stock actuel : {ajusterPiece?.quantiteDisponible}</p>
          <div className="space-y-2">
            <Label>Delta (+ ou -)</Label>
            <Input type="number" placeholder="ex: -2 ou 10" value={delta} onChange={(e) => setDelta(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAjusterPiece(null)}>Annuler</Button>
            <Button disabled={!delta || ajusterMutation.isPending} onClick={() => ajusterPiece && ajusterMutation.mutate({ id: ajusterPiece.id, delta: Number(delta) })}>Appliquer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
