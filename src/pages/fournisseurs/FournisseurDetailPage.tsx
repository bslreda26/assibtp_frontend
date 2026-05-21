import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as fournisseursService from '@/services/fournisseurs.service'

export function FournisseurDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: f, isLoading } = useQuery({
    queryKey: ['fournisseurs', Number(id)],
    queryFn: () => fournisseursService.getFournisseur(Number(id)),
    enabled: !Number.isNaN(Number(id)),
  })

  if (isLoading) return <TableSkeleton cols={2} />
  if (!f) return <p>Fournisseur introuvable</p>

  return (
    <div className="space-y-6">
      <PageHeader title={f.nom} action={<Button variant="outline" asChild><Link to="/fournisseurs"><ArrowLeft className="size-4" />Retour</Link></Button>} />
      <Card>
        <CardHeader><CardTitle className="text-base">Coordonnées</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
          <div><p className="text-muted-foreground">Téléphone</p><p>{f.telephone ?? '—'}</p></div>
          <div><p className="text-muted-foreground">E-mail</p><p>{f.email ?? '—'}</p></div>
          <div><p className="text-muted-foreground">Type</p><p>{f.typeFourniture ?? '—'}</p></div>
          <div className="sm:col-span-2"><p className="text-muted-foreground">Adresse</p><p>{f.adresse ?? '—'}</p></div>
        </CardContent>
      </Card>
    </div>
  )
}
