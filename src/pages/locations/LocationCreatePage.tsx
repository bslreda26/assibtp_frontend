import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
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
import * as clientsService from '@/services/clients.service'
import * as gruesService from '@/services/grues.service'
import * as locationsService from '@/services/locations.service'

export function LocationCreatePage() {
  const navigate = useNavigate()
  const [clientId, setClientId] = useState('')
  const [grueId, setGrueId] = useState('')
  const [dateSortie, setDateSortie] = useState('')
  const [dateFin, setDateFin] = useState('')
  const [dateProvisoire, setDateProvisoire] = useState('')
  const [prixParJour, setPrixParJour] = useState('')
  const [notes, setNotes] = useState('')

  const { data: clients } = useQuery({
    queryKey: ['clients', 'all'],
    queryFn: () => clientsService.listClients({ page: 1, limit: 100 }),
  })

  const { data: grues } = useQuery({
    queryKey: ['grues', 'disponibles'],
    queryFn: gruesService.getGruesDisponibles,
  })

  const mutation = useMutation({
    mutationFn: locationsService.createLocation,
    onSuccess: (loc) => {
      toast.success('Location créée')
      navigate(`/locations/${loc.id}`)
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate({
      clientId: Number(clientId),
      grueId: Number(grueId),
      dateSortie: toApiDateFromInput(dateSortie),
      dateFin: toApiDateFromInput(dateFin),
      dateProvisoire: dateProvisoire ? toApiDateFromInput(dateProvisoire) : null,
      prixParJour: Number(prixParJour),
      notes: notes || null,
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle location"
        action={<Button variant="outline" asChild><Link to="/locations"><ArrowLeft className="size-4" />Retour</Link></Button>}
      />
      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl">
          <CardHeader><CardTitle className="text-base">Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choisir un client" /></SelectTrigger>
                <SelectContent>
                  {clients?.data.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Grue disponible *</Label>
              <Select value={grueId} onValueChange={setGrueId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choisir une grue" /></SelectTrigger>
                <SelectContent>
                  {grues?.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.nom} — {g.modele}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Date sortie *</Label><Input type="date" value={dateSortie} onChange={(e) => setDateSortie(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Date fin *</Label><Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Date provisoire</Label><Input type="date" value={dateProvisoire} onChange={(e) => setDateProvisoire(e.target.value)} /></div>
              <div className="space-y-2"><Label>Prix par jour (FCFA) *</Label><Input type="number" min={1} value={prixParJour} onChange={(e) => setPrixParJour(e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!clientId || !grueId || !dateSortie || !dateFin || !prixParJour || mutation.isPending}>
              {mutation.isPending ? 'Création…' : 'Créer la location'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
