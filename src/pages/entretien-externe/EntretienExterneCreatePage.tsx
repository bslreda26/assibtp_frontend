import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getApiErrorMessage } from '@/lib/api'
import { toApiDateFromInput } from '@/lib/format'
import * as entretienExterneService from '@/services/entretien-externe.service'
import * as gruesService from '@/services/grues.service'
import * as fournisseursService from '@/services/fournisseurs.service'

type LigneForm = { descriptionPiece: string; quantite: string; prixUnitaire: string }

export function EntretienExterneCreatePage() {
  const navigate = useNavigate()
  const [grueId, setGrueId] = useState('')
  const [fournisseurId, setFournisseurId] = useState('')
  const [dateEntretien, setDateEntretien] = useState('')
  const [description, setDescription] = useState('')
  const [lignes, setLignes] = useState<LigneForm[]>([{ descriptionPiece: '', quantite: '1', prixUnitaire: '' }])

  const { data: grues } = useQuery({ queryKey: ['grues', 'all'], queryFn: () => gruesService.listGrues({ page: 1, limit: 100 }) })
  const { data: fournisseurs } = useQuery({ queryKey: ['fournisseurs', 'all'], queryFn: () => fournisseursService.listFournisseurs({ page: 1, limit: 100 }) })

  const mutation = useMutation({
    mutationFn: entretienExterneService.createEntretienExterne,
    onSuccess: (e) => { toast.success('Entretien créé'); navigate(`/entretien-externe/${e.id}`) },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Nouvel entretien externe" action={<Button variant="outline" asChild><Link to="/entretien-externe"><ArrowLeft className="size-4" />Retour</Link></Button>} />
      <Card className="max-w-2xl">
        <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Grue *</Label>
              <Select value={grueId} onValueChange={setGrueId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Grue" /></SelectTrigger>
                <SelectContent>{grues?.data.filter(g => g.statut !== 'EN_LOCATION').map((g) => <SelectItem key={g.id} value={String(g.id)}>{g.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fournisseur *</Label>
              <Select value={fournisseurId} onValueChange={setFournisseurId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Fournisseur" /></SelectTrigger>
                <SelectContent>{fournisseurs?.data.map((f) => <SelectItem key={f.id} value={String(f.id)}>{f.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>Date *</Label><Input type="date" value={dateEntretien} onChange={(e) => setDateEntretien(e.target.value)} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Lignes *</Label>
            {lignes.map((l, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <Input className="flex-1 min-w-[140px]" placeholder="Description pièce" value={l.descriptionPiece} onChange={(e) => { const n = [...lignes]; n[i].descriptionPiece = e.target.value; setLignes(n) }} />
                <Input type="number" className="w-20" placeholder="Qté" value={l.quantite} onChange={(e) => { const n = [...lignes]; n[i].quantite = e.target.value; setLignes(n) }} />
                <Input type="number" className="w-32" placeholder="Prix unit." value={l.prixUnitaire} onChange={(e) => { const n = [...lignes]; n[i].prixUnitaire = e.target.value; setLignes(n) }} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setLignes(lignes.filter((_, idx) => idx !== i))} disabled={lignes.length <= 1}><Trash2 className="size-4" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => setLignes([...lignes, { descriptionPiece: '', quantite: '1', prixUnitaire: '' }])}><Plus className="size-4" />Ligne</Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            disabled={!grueId || !fournisseurId || !dateEntretien || lignes.some(l => !l.descriptionPiece || !l.quantite || !l.prixUnitaire) || mutation.isPending}
            onClick={() => mutation.mutate({
              grueId: Number(grueId),
              fournisseurId: Number(fournisseurId),
              dateEntretien: toApiDateFromInput(dateEntretien),
              description: description || null,
              lignes: lignes.map(l => ({ descriptionPiece: l.descriptionPiece, quantite: Number(l.quantite), prixUnitaire: Number(l.prixUnitaire) })),
            })}
          >
            Créer
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
