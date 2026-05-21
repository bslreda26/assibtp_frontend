# Cursor Agent Prompt — GrueBTP Frontend (React)

---

## COPY THIS ENTIRE PROMPT INTO CURSOR AGENT

---

You are building a **modern, professional web application** for crane rental and maintenance management (**Gestion des Grues — GrueBTP**). The backend is **already built** (AdonisJS + MySQL). Your job is to create a frontend that matches the API **exactly**.

**Language:** French UI (labels, messages, dates). Code in English (components, types, files).

**Backend reference:** read `API.md` in the backend repo (`gruebtpback/API.md`).

**Base API URL:** `http://localhost:3333/api/v1`

---

## DESIGN DIRECTION (modern & pro)

Build a **premium B2B operations dashboard** — not a generic admin template.

| Principle | Guideline |
|-----------|-----------|
| **Look** | Clean, spacious, dark sidebar + light content **or** refined light mode with strong contrast |
| **Typography** | `Inter` or `Plus Jakarta Sans` — clear hierarchy (page title 24–28px, sections 16–18px) |
| **Color** | Industrial palette: slate/neutral base + **amber/orange accent** (construction/crane identity) + semantic colors for statuts |
| **Components** | shadcn/ui + Tailwind CSS 4 (or latest stable Tailwind 3) |
| **Icons** | Lucide React |
| **Charts** | Recharts on dashboard (bar/line for revenue, donuts for fleet status) |
| **Tables** | Sortable data tables with search, pagination, skeleton loaders, empty states |
| **Forms** | react-hook-form + zod — inline validation, clear error messages in French |
| **Feedback** | Sonner toasts for success/error; confirm dialogs for delete/terminer |
| **Motion** | Subtle transitions only (150–200ms) — no heavy animation |

**Statut badges (consistent everywhere):**

| Statut | Couleur |
|--------|---------|
| DISPONIBLE | green |
| EN_LOCATION | blue |
| EN_ENTRETIEN | amber |
| HORS_SERVICE | red |
| EN_COURS | blue |
| TERMINEE / TERMINE | slate |
| ANNULEE / ANNULE | red muted |

---

## TECH STACK (required)

```bash
npm create vite@latest gruebtpfront -- --template react-ts
cd gruebtpfront
npm install react-router-dom @tanstack/react-query axios zod react-hook-form @hookform/resolvers date-fns luxon sonner
npm install -D tailwindcss @tailwindcss/vite
npx shadcn@latest init
```

Add shadcn components as needed:

```bash
npx shadcn@latest add button card input label table dialog dropdown-menu badge avatar separator sheet tabs select calendar popover command skeleton toast form alert
```

**Optional but recommended:** `@tanstack/react-table` for advanced tables.

---

## ENVIRONMENT

```env
# .env
VITE_API_URL=http://localhost:3333/api/v1
```

---

## API CONTRACT (strict)

### Auth header (all protected routes)

```
Authorization: Bearer <token>
```

### Response shapes

```typescript
// Success
type ApiSuccess<T> = { success: true; data: T }

// Error
type ApiError = { success: false; error: string; details?: unknown }

// Paginated list (Lucid paginate)
type Paginated<T> = {
  meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  data: T[]
}
```

### Auth responses

```typescript
// POST /auth/login | /auth/signup
type AuthResponse = {
  success: true
  data: {
    user: { id: number; nom: string; email: string; role: 'ADMIN' | 'TECHNICIEN' }
    token: string
  }
}

// GET /auth/me
type MeResponse = { success: true; data: { id: number; nom: string; email: string; role: 'ADMIN' | 'TECHNICIEN' } }
```

Store `token` in `localStorage` (key: `gruebtp_token`). Store `user` in context or localStorage (`gruebtp_user`).

### IDs

Backend uses **integer IDs** (`number`), not UUID strings.

### Dates

Send ISO strings in requests: `"2025-04-01T00:00:00.000Z"` or date-only `"2025-04-01"`.

Display with `date-fns` + locale `fr`.

### Money (FCFA)

Format amounts as **FCFA** without decimals in UI: `150 000 FCFA` (space thousands separator).

---

## AXIOS CLIENT (implement first)

```typescript
// src/lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gruebtp_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gruebtp_token')
      localStorage.removeItem('gruebtp_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

Extract API errors for toasts:

```typescript
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const d = error.response.data as { error?: string; details?: unknown }
    return d.error ?? 'Une erreur est survenue'
  }
  return 'Une erreur est survenue'
}
```

---

## ROLES (UI must respect backend)

| Feature | ADMIN | TECHNICIEN |
|---------|-------|------------|
| Dashboard | yes | yes |
| Clients CRUD | yes, delete yes | yes, **no delete button** |
| Grues CRUD | full | **read only** (list + detail) |
| Locations | full + terminer + facture | full |
| Fournisseurs | full | **read only** |
| Stock catalogue (POST/PUT) | yes | **hidden** |
| Stock ajuster | yes | yes |
| Entretien local/externe | full | full |
| Users (POST /users) | yes | **hidden** |
| Signup page | public | public |

Use `user.role === 'ADMIN'` to show/hide actions. Never call admin-only endpoints from TECHNICIEN UI.

---

## APP STRUCTURE

```
gruebtpfront/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── lib/
│   │   ├── api.ts
│   │   ├── utils.ts
│   │   └── format.ts          # money, dates FR
│   ├── types/
│   │   ├── api.ts
│   │   ├── client.ts
│   │   ├── grue.ts
│   │   ├── location.ts
│   │   ├── stock.ts
│   │   └── entretien.ts
│   ├── services/                # one file per resource
│   │   ├── auth.service.ts
│   │   ├── clients.service.ts
│   │   ├── grues.service.ts
│   │   ├── locations.service.ts
│   │   ├── fournisseurs.service.ts
│   │   ├── stock.service.ts
│   │   ├── entretien-local.service.ts
│   │   ├── entretien-externe.service.ts
│   │   └── dashboard.service.ts
│   ├── hooks/
│   │   ├── useAuth.tsx
│   │   └── usePermissions.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # sidebar + header + outlet
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── shared/
│   │   │   ├── PageHeader.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   └── forms/
│   │       └── ...
│   └── pages/
│       ├── auth/
│       │   ├── LoginPage.tsx
│       │   └── SignupPage.tsx
│       ├── DashboardPage.tsx
│       ├── clients/
│       ├── grues/
│       ├── locations/
│       ├── fournisseurs/
│       ├── stock/
│       ├── entretien-local/
│       ├── entretien-externe/
│       └── admin/
│           └── UsersPage.tsx      # ADMIN only
└── .env
```

---

## ROUTES (React Router v6)

```typescript
/login                    # public
/signup                   # public

/                         # protected → redirect /dashboard
/dashboard

/clients
/clients/:id

/grues
/grues/:id

/locations
/locations/new
/locations/:id

/fournisseurs
/fournisseurs/:id

/stock
/stock/:id

/entretien-local
/entretien-local/new
/entretien-local/:id

/entretien-externe
/entretien-externe/new
/entretien-externe/:id

/admin/users              # ADMIN only
```

**ProtectedRoute:** redirect to `/login` if no token.  
**AdminRoute:** redirect to `/dashboard` if not ADMIN.

---

## SIDEBAR NAVIGATION (French labels)

```
Tableau de bord
Clients
Grues
Locations
Fournisseurs
Stock pièces
Entretien local
Entretien externe
---
Utilisateurs          (ADMIN only)
---
Déconnexion
```

Active route highlight. Collapsible sidebar on mobile (sheet).

---

## PAGES — DETAILED REQUIREMENTS

### 1. Login / Signup

- Centered card on subtle gradient or industrial photo overlay (optional, keep performant)
- Login: email + password → `POST /auth/login` → save token + user → `/dashboard`
- Signup: nom, email, password, passwordConfirmation → `POST /auth/signup` → auto TECHNICIEN
- Demo hint box: `admin@grues.com` / `Admin123!` and `tech@grues.com` / `Tech123!`
- Link between login ↔ signup

### 2. Dashboard (`GET /dashboard/stats`)

- **6 stat cards:** Total grues, En location, En entretien, Locations en cours, Alertes stock, Revenu du mois (FCFA)
- **Chart:** fleet status breakdown (pie or bar)
- **Quick actions:** Nouvelle location, Entretien local, Voir grues disponibles
- **Alert list:** if `stockAlerts > 0`, link to `/stock?alerte=true`

### 3. Clients

- Table: nom, téléphone, email, actions
- Search debounced → `?search=`
- Pagination from API meta
- Create/Edit modal or drawer
- Detail page: client info + **locations history** (from `GET /clients/:id` preload)
- Delete: ADMIN only, confirm dialog, handle 409 conflict message

### 4. Grues

- Table with **StatusBadge**, filtres par statut
- ADMIN: create/edit/delete
- TECHNICIEN: view only
- Detail: specs + tabs (locations, entretiens)
- Quick filter chip: **Disponibles** → `GET /grues/disponibles`

### 5. Locations (core workflow)

- List: client, grue, dates, statut, prix/jour
- **Create form:**
  - Select client (searchable combobox)
  - Select grue from `GET /grues/disponibles` only
  - dateSortie, dateFin, dateProvisoire (optional), prixParJour, notes
  - Submit `POST /locations`
- Detail:
  - **Terminer** button if EN_COURS → `PATCH /locations/:id/terminer`
  - **Facture** panel → `GET /locations/:id/facture` show jours, prix/jour, total FCFA
- Handle 400 errors (grue not disponible) with toast

### 6. Fournisseurs

- Same CRUD pattern as clients
- ADMIN write, TECHNICIEN read-only

### 7. Stock

- Table: nom, référence, quantité, seuil, prix unitaire
- Filter **Alertes** toggle → `?alerte=true` (highlight rows below seuil)
- ADMIN: add/edit catalogue
- **Ajuster** dialog: delta (+/-) → `PATCH /stock/:id/ajuster`

### 8. Entretien local

- List with statut, grue, date, technicien
- **Create wizard:**
  1. Select grue (not EN_LOCATION)
  2. Date, technicien, description
  3. **Lignes:** add rows (piece from stock + quantité), min 1 ligne
  - Submit `POST /entretien-local` with `{ grueId, dateEntretien, lignes: [{ pieceId, quantite }] }`
- Detail: lignes with pièces
- **Terminer** if EN_COURS
- Delete if EN_COURS (restores stock on backend)

### 9. Entretien externe

- Similar to local but lignes are free-form: `descriptionPiece`, `quantite`, `prixUnitaire`
- Select fournisseur
- Show `coutTotal` on detail

### 10. Admin — Users (ADMIN only)

- Form: nom, email, password, role (ADMIN | TECHNICIEN)
- `POST /users`
- Simple table of users (optional: extend backend later for list)

---

## TANSTACK QUERY KEYS (convention)

```typescript
['dashboard', 'stats']
['clients', { page, search }]
['clients', id]
['grues', { page, statut }]
['grues', 'disponibles']
['locations', { page, statut }]
['locations', id]
['locations', id, 'facture']
// etc.
```

Invalidate related queries after mutations (e.g. after create location → invalidate grues + locations + dashboard).

---

## IMPLEMENTATION ORDER (step by step)

Follow this order **exactly** — each step should be testable against the running backend (`npm run dev` in `gruebtpback`).

| Step | Task | Verify |
|------|------|--------|
| **1** | Vite + Tailwind + shadcn + folder structure | App boots |
| **2** | `api.ts`, types, `format.ts` (FCFA, dates FR) | — |
| **3** | Auth service + `AuthProvider` + Login/Signup pages | Login with admin@grues.com |
| **4** | `AppLayout` + Sidebar + protected routes | Navigate after login |
| **5** | Dashboard page + stats + charts | Stats match API |
| **6** | Clients CRUD + role-based delete | List/create/edit |
| **7** | Grues list/detail + ADMIN forms | Disponibles filter |
| **8** | Locations list/create/detail/terminer/facture | Full rental flow |
| **9** | Stock + alertes + ajuster | Delta adjustment |
| **10** | Fournisseurs CRUD | Admin vs technicien |
| **11** | Entretien local (wizard + lignes) | Stock decreases |
| **12** | Entretien externe | Cout total displays |
| **13** | Admin users page | Create TECHNICIEN |
| **14** | Polish: loading skeletons, empty states, 403/422 handling, mobile sidebar | UX pass |

---

## QUALITY CHECKLIST (before calling it done)

- [ ] All API calls use `VITE_API_URL` and Bearer token
- [ ] No admin actions visible to TECHNICIEN
- [ ] French UI throughout
- [ ] FCFA formatting on all money fields
- [ ] Pagination works on list endpoints
- [ ] Toast on success/error for every mutation
- [ ] 401 redirects to login
- [ ] Forms validate before submit (zod schemas mirror backend rules)
- [ ] Responsive: usable on tablet (1024px) and mobile (sidebar sheet)
- [ ] Lighthouse: reasonable performance (no huge images)

---

## DEMO CREDENTIALS (for testing)

| Email | Password | Role |
|-------|----------|------|
| admin@grues.com | Admin123! | ADMIN |
| tech@grues.com | Tech123! | TECHNICIEN |

**Start backend before frontend:**

```bash
cd gruebtpback
npm run dev
# API → http://localhost:3333
```

**Start frontend:**

```bash
cd gruebtpfront
npm run dev
# App → http://localhost:5173
```

---

## DO NOT

- Do not use UUID for IDs — backend uses integers
- Do not invent API endpoints — only use routes from `API.md`
- Do not use Next.js unless explicitly asked — use **Vite + React SPA**
- Do not use Material UI — use **shadcn/ui** for a distinct modern look
- Do not hardcode French backend error strings in components — display `error` from API
- Do not skip role checks — backend returns 403 but UI must hide forbidden actions

---

## OPTIONAL ENHANCEMENTS (after MVP)

- Export facture location as PDF
- Global search (cmd+K)
- Notifications for stock alerts
- i18n toggle (FR/EN) — FR is default
- Dark mode toggle in header

Build a cohesive, production-quality UI that feels like a real **construction equipment SaaS** product, not a student project.
