import { useAuth } from '@/hooks/useAuth'

export function usePermissions() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isTechnicien = user?.role === 'TECHNICIEN'

  return {
    isAdmin,
    isTechnicien,
    canDeleteClients: isAdmin,
    canManageGrues: isAdmin,
    canManageFournisseurs: isAdmin,
    canManageStockCatalogue: isAdmin,
    canManageUsers: isAdmin,
  }
}
