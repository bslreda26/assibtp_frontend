import { Link } from 'react-router-dom'
import { ClipboardPlus, Truck, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const actions = [
  {
    to: '/locations/new',
    label: 'Nouvelle location',
    description: 'Créer une location pour un client',
    icon: ClipboardPlus,
  },
  {
    to: '/entretien-local/new',
    label: 'Entretien local',
    description: 'Démarrer un entretien atelier',
    icon: Wrench,
  },
  {
    to: '/grues?disponibles=true',
    label: 'Grues disponibles',
    description: 'Voir la flotte disponible',
    icon: Truck,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {actions.map(({ to, label, description, icon: Icon }) => (
          <Button
            key={to}
            variant="outline"
            className="h-auto w-full justify-start gap-3 px-4 py-3"
            asChild
          >
            <Link to={to}>
              <Icon className="size-4 shrink-0 text-primary" />
              <div className="text-left">
                <p className="font-medium">{label}</p>
                <p className="text-xs font-normal text-muted-foreground">
                  {description}
                </p>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
