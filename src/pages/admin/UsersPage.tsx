import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
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
import { getApiErrorMessage } from '@/lib/api'
import * as usersService from '@/services/users.service'
import type { UserRole } from '@/types/api'

export function UsersPage() {
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('TECHNICIEN')
  const [created, setCreated] = useState<{ nom: string; email: string; role: UserRole } | null>(null)

  const mutation = useMutation({
    mutationFn: usersService.createUser,
    onSuccess: (user) => {
      toast.success('Utilisateur créé')
      setCreated({ nom: user.nom, email: user.email, role: user.role })
      setNom('')
      setEmail('')
      setPassword('')
      setRole('TECHNICIEN')
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs"
        description="Création de comptes ADMIN ou TECHNICIEN (réservé administrateur)."
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Nouvel utilisateur</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom *</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>E-mail *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Mot de passe *</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="TECHNICIEN">TECHNICIEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            disabled={!nom || !email || password.length < 8 || mutation.isPending}
            onClick={() => mutation.mutate({ nom, email, password, role })}
          >
            {mutation.isPending ? 'Création…' : 'Créer l\'utilisateur'}
          </Button>
        </CardFooter>
      </Card>
      {created && (
        <Card className="max-w-lg border-emerald-200 bg-emerald-50">
          <CardContent className="pt-6 text-sm text-emerald-950">
            <p className="font-medium">Dernier compte créé</p>
            <p>{created.nom} — {created.email} ({created.role})</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
