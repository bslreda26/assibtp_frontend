import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AdminRoute } from '@/components/routing/AdminRoute'
import { ProtectedRoute } from '@/components/routing/ProtectedRoute'
import { PublicRoute } from '@/components/routing/PublicRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UsersPage } from '@/pages/admin/UsersPage'
import { ClientsPage } from '@/pages/clients/ClientsPage'
import { ClientDetailPage } from '@/pages/clients/ClientDetailPage'
import { GruesPage } from '@/pages/grues/GruesPage'
import { GrueDetailPage } from '@/pages/grues/GrueDetailPage'
import { LocationsPage } from '@/pages/locations/LocationsPage'
import { LocationCreatePage } from '@/pages/locations/LocationCreatePage'
import { LocationDetailPage } from '@/pages/locations/LocationDetailPage'
import { FournisseursPage } from '@/pages/fournisseurs/FournisseursPage'
import { FournisseurDetailPage } from '@/pages/fournisseurs/FournisseurDetailPage'
import { StockPage } from '@/pages/stock/StockPage'
import { EntretienLocalPage } from '@/pages/entretien-local/EntretienLocalPage'
import { EntretienLocalCreatePage } from '@/pages/entretien-local/EntretienLocalCreatePage'
import { EntretienLocalDetailPage } from '@/pages/entretien-local/EntretienLocalDetailPage'
import { EntretienExternePage } from '@/pages/entretien-externe/EntretienExternePage'
import { EntretienExterneCreatePage } from '@/pages/entretien-externe/EntretienExterneCreatePage'
import { EntretienExterneDetailPage } from '@/pages/entretien-externe/EntretienExterneDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="clients" element={<ClientsPage />} />
            <Route path="clients/:id" element={<ClientDetailPage />} />

            <Route path="grues" element={<GruesPage />} />
            <Route path="grues/:id" element={<GrueDetailPage />} />

            <Route path="locations" element={<LocationsPage />} />
            <Route path="locations/new" element={<LocationCreatePage />} />
            <Route path="locations/:id" element={<LocationDetailPage />} />

            <Route path="fournisseurs" element={<FournisseursPage />} />
            <Route path="fournisseurs/:id" element={<FournisseurDetailPage />} />

            <Route path="stock" element={<StockPage />} />

            <Route path="entretien-local" element={<EntretienLocalPage />} />
            <Route path="entretien-local/new" element={<EntretienLocalCreatePage />} />
            <Route path="entretien-local/:id" element={<EntretienLocalDetailPage />} />

            <Route path="entretien-externe" element={<EntretienExternePage />} />
            <Route path="entretien-externe/new" element={<EntretienExterneCreatePage />} />
            <Route path="entretien-externe/:id" element={<EntretienExterneDetailPage />} />

            <Route element={<AdminRoute />}>
              <Route path="admin/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
