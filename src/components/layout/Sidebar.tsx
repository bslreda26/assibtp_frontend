import { Link, useLocation } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Package,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { AppBrand } from '@/components/shared/AppBrand'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/grues', label: 'Grues', icon: Truck },
  { to: '/locations', label: 'Locations', icon: ClipboardList },
  { to: '/fournisseurs', label: 'Fournisseurs', icon: Building2 },
  { to: '/stock', label: 'Stock pièces', icon: Package },
  { to: '/entretien-local', label: 'Entretien local', icon: Wrench },
  { to: '/entretien-externe', label: 'Entretien externe', icon: Wrench },
]

type SidebarProps = {
  onNavigate?: () => void
  className?: string
}

export function Sidebar({ onNavigate, className }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuth()
  const { canManageUsers } = usePermissions()

  const handleLogout = async () => {
    await logout()
    onNavigate?.()
  }

  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground',
        className
      )}
    >
      <div className="border-b border-sidebar-border px-4 py-4">
        <AppBrand variant="sidebar" />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active =
            location.pathname === to ||
            (to !== '/dashboard' && location.pathname.startsWith(to))
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        {canManageUsers && (
          <>
            <Separator className="my-3 bg-sidebar-border" />
            <Link
              to="/admin/users"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                location.pathname.startsWith('/admin')
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Users className="size-4 shrink-0" />
              Utilisateurs
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="truncate text-sm font-medium">{user?.nom}</p>
        <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
        <p className="mt-0.5 text-xs text-sidebar-primary">{user?.role}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => void handleLogout()}
        >
          <LogOut className="size-4" />
          Déconnexion
        </Button>
      </div>
    </aside>
  )
}
