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
import * as entretienLocalService from '@/services/entretien-local.service'
import * as gruesService from '@/services/grues.service'
import * as stockService from '@/services/stock.service'

type LigneForm = { pieceId: string; quantite: string }

export function EntretienLocalCreatePage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [grueId, setGrueId] = useState('')
  const [dateEntretien, setDateEntretien] = useState('')
  const [technicien, setTechnicien] = useState('')
  const [description, setDescription] = useState('')
  const [lignes, setLignes] = useState<LigneForm[]>([{ pieceId: '', quantite: '1' }])

  const { data: gruesData } = useQuery({
    queryKey: ['grues', 'for-entretien'],
    queryFn: () => gruesService.listGrues({ page: 1, limit: 100 }),
  })
  const gruesEligible = gruesData?.data.filter((g) => g.statut !== 'EN_LOCATION') ?? []

  const { data: stock } = useQuery({
    queryKey: ['stock', 'all'],
    queryFn: () => stockService.listStock({ page: 1, limit: 200 }),
  })

  const mutation = useMutation({
    mutationFn: entretienLocalService.createEntretienLocal,
    onSuccess: (e) => {
      toast.success('Entretien créé')
      navigate(`/entretien-local/${e.id}`)
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const addLigne = () => setLignes([...lignes, { pieceId: '', quantite: '1' }])
  const removeLigne = (i: number) => setLignes(lignes.filter((_, idx) => idx !== i))

  const submit = () => {
    mutation.mutate({
      grueId: Number(grueId),
      dateEntretien: toApiDateFromInput(dateEntretien),
      technicien: technicien || null,
      description: description || null,
      lignes: lignes.map((l) => ({ pieceId: Number(l.pieceId), quantite: Number(l.quantite) })),
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Nouvel entretien local" action={<Button variant="outline" asChild><Link to="/entretien-local"><ArrowLeft className="size-4" />Retour</Link></Button>} />
      <div className="flex gap-2 text-sm">
        {[1, 2, 3].map((s) => (
          <span key={s} className={step === s ? 'font-semibold text-primary' : 'text-muted-foreground'}>Étape {s}</span>
        ))}
      </div>

      <Card className="max-w-2xl">
        {step === 1 && (
          <>
            <CardHeader><CardTitle className="text-base">1. Grue</CardTitle></CardHeader>
            <CardContent>
              <Label>Grue (hors location) *</Label>
              <Select value={grueId} onValueChange={setGrueId}>
                <SelectTrigger className="mt-2 w-full"><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {gruesEligible.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.nom} — {g.statut}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter><Button disabled={!grueId} onClick={() => setStep(2)}>Suivant</Button></CardFooter>
          </>
        )}
        {step === 2 && (
          <>
            <CardHeader><CardTitle className="text-base">2. Informations</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Date *</Label><Input type="date" value={dateEntretien} onChange={(e) => setDateEntretien(e.target.value)} /></div>
              <div className="space-y-2"><Label>Technicien</Label><Input value={technicien} onChange={(e) => setTechnicien(e.target.value)} /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
              <Button disabled={!dateEntretien} onClick={() => setStep(3)}>Suivant</Button>
            </CardFooter>
          </>
        )}
        {step === 3 && (
          <>
            <CardHeader><CardTitle className="text-base">3. Pièces utilisées</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {lignes.map((ligne, i) => (
                <div key={i} className="flex gap-2">
                  <Select value={ligne.pieceId} onValueChange={(v) => { const n = [...lignes]; n[i].pieceId = v; setLignes(n) }}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Pièce" /></SelectTrigger>
                    <SelectContent>
                      {stock?.data.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>{p.nom} (stock: {p.quantiteDisponible})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input type="number" min={1} className="w-24" value={ligne.quantite} onChange={(e) => { const n = [...lignes]; n[i].quantite = e.target.value; setLignes(n) }} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeLigne(i)} disabled={lignes.length <= 1}><Trash2 className="size-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addLigne}><Plus className="size-4" />Ajouter une ligne</Button>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
              <Button
                disabled={lignes.some((l) => !l.pieceId || !l.quantite) || mutation.isPending}
                onClick={submit}
              >
                {mutation.isPending ? 'Création…' : 'Créer l\'entretien'}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}
