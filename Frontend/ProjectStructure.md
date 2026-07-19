# ProjectStructure.md — Clinic Management System

## 1. Improvements Made vs. the Proposed Structure

The originally proposed structure was already close to industry
standard. The following refinements were applied:

| Change | Reason |
|---|---|
| Kept `service/` (not renamed to `services/`) | Matches the brief exactly; either is valid industry convention — consistency with the brief wins. |
| Added `jsconfig.json` alongside Vite aliases | Vite aliases (`vite.config.js`) only affect the bundler; editors/IDEs need `jsconfig.json`'s `paths` to resolve `@components/...` for autocomplete and go-to-definition. |
| Added `components/common/ErrorBoundary.jsx` and `components/common/PagePlaceholder.jsx` | Required by the "Error Boundaries" coding standard and needed to scaffold routes without implementing business features — kept as flat files (not folders) since they're single-purpose, not reusable primitives. |
| Added `components/common/index.js` barrel | Allows `import { Button, Modal } from "@components/common"` in addition to per-component imports — convenience only, per-component imports still work. |
| Kept `medicine/patient/prescription/dashboard` folders under `components/` empty of files, present as directories | Per instructions: architecture only, no business components yet. Folders exist so feature work has an obvious home. |
| `.env.example` added at root | `api/axios.js` reads `VITE_API_BASE_URL`; documented so the base URL isn't hardcoded. |
| Removed default Vite boilerplate (`App.css`, `react.svg`, counter demo) | Dead weight not part of the architecture. |

No folders were removed from the brief — the proposed structure's shape
was sound and is preserved in full below.

## 2. Full Directory Tree

```
clinic-management-system/
├── Agent.md
├── Design.md
├── ProjectStructure.md
├── index.html
├── jsconfig.json
├── vite.config.js
├── package.json
├── .env.example
├── public/
│   ├── favicon.svg
│   └── icons.svg
└── src/
    ├── main.jsx                  # React root, mounts <App />, imports globals.css
    ├── App.jsx                   # Composes all providers + AppRoutes
    │
    ├── api/
    │   ├── axios.js              # Axios instance, request/response interceptors, refresh-token flow
    │   └── endpoints.js          # ENDPOINTS constant — every API path, grouped by module
    │
    ├── assets/
    │   ├── images/
    │   ├── icons/
    │   └── fonts/
    │
    ├── components/
    │   ├── common/                    # Feature-agnostic, reusable primitives
    │   │   ├── Button/{Button.jsx, index.js}
    │   │   ├── Input/{Input.jsx, index.js}
    │   │   ├── Select/{Select.jsx, index.js}
    │   │   ├── TextArea/{TextArea.jsx, index.js}
    │   │   ├── Loader/{Loader.jsx, index.js}
    │   │   ├── Modal/{Modal.jsx, index.js}
    │   │   ├── Table/{Table.jsx, index.js}
    │   │   ├── Pagination/{Pagination.jsx, index.js}
    │   │   ├── SearchBar/{SearchBar.jsx, index.js}
    │   │   ├── EmptyState/{EmptyState.jsx, index.js}
    │   │   ├── ErrorState/{ErrorState.jsx, index.js}
    │   │   ├── Badge/{Badge.jsx, index.js}
    │   │   ├── Card/{Card.jsx, index.js}
    │   │   ├── Avatar/{Avatar.jsx, index.js}
    │   │   ├── ConfirmDialog/{ConfirmDialog.jsx, index.js}
    │   │   ├── ErrorBoundary.jsx
    │   │   ├── PagePlaceholder.jsx
    │   │   └── index.js               # convenience barrel for the whole folder
    │   ├── layout/                    # App shell chrome
    │   │   ├── Sidebar/{Sidebar.jsx, index.js}
    │   │   ├── Navbar/{Navbar.jsx, index.js}
    │   │   ├── Footer/{Footer.jsx, index.js}
    │   │   └── Breadcrumb/{Breadcrumb.jsx, index.js}
    │   ├── dashboard/                 # (empty — Dashboard composite components go here)
    │   ├── medicine/                  # (empty — Medicine composite components go here)
    │   ├── patient/                   # (empty — Patient composite components go here)
    │   └── prescription/              # (empty — Prescription composite components go here)
    │
    ├── context/
    │   └── AuthContext.jsx        # user/session state, login/logout, auto-logout, session-expired listener
    │
    ├── helpers/                   # (reserved — cross-cutting non-pure helpers; prefer utils/ first)
    │
    ├── hooks/
    │   ├── useAuth.js             # consumes AuthContext
    │   ├── useDebounce.js         # debounced value, used by SearchBar
    │   ├── usePagination.js       # page/limit/totalPages controller for list screens
    │   └── useModal.js            # open/close/toggle controller for Modal/ConfirmDialog
    │
    ├── layouts/
    │   ├── AuthLayout.jsx         # centered card shell for /login
    │   └── DashboardLayout.jsx    # Sidebar + Navbar + Breadcrumb + Footer shell for authenticated routes
    │
    ├── pages/
    │   ├── Auth/{Login.jsx, index.js}                                    # fully implemented
    │   ├── Dashboard/{Dashboard.jsx, index.js}                           # placeholder — scaffolded only
    │   ├── Medicine/{MedicineList,AddMedicine,EditMedicine}.jsx, index.js # placeholders
    │   ├── Patient/{PatientList,AddPatient,PatientDetails}.jsx, index.js  # placeholders
    │   ├── Prescription/{AddPrescription,History}.jsx, index.js           # placeholders
    │   ├── Settings/{Settings.jsx, index.js}                              # placeholder
    │   ├── Profile/{Profile.jsx, index.js}                                # placeholder
    │   └── NotFound/{NotFound.jsx, index.js}                              # fully implemented
    │
    ├── routes/
    │   ├── AppRoutes.jsx          # central route table, every page lazy-loaded
    │   ├── ProtectedRoute.jsx     # auth guard — redirects to /login, preserves intended destination
    │   └── PublicRoute.jsx        # redirects authenticated users away from /login
    │
    ├── service/                   # ONLY layer allowed to call axios
    │   ├── auth.service.js        # fully implemented — login/logout/refreshToken/getCurrentUser
    │   ├── medicine.service.js    # stub — shape defined, methods to be filled in
    │   ├── patient.service.js     # stub
    │   ├── prescription.service.js # stub
    │   └── dashboard.service.js   # stub
    │
    ├── utils/
    │   ├── constants.js           # APP_NAME, STORAGE_KEYS, ROUTES, QUERY_KEYS, PAGINATION_DEFAULTS, AUTO_LOGOUT_MS
    │   ├── helpers.js             # cn(), debounceValue(), truncate(), getInitials(), isEmpty()
    │   ├── storage.js             # localStorage wrapper (get/set/remove/clear, JSON-safe)
    │   ├── formatter.js           # formatDate, formatDateTime, formatCurrency, formatNumber
    │   └── validators.js          # shared Zod primitives (emailSchema, passwordSchema, phoneSchema, loginSchema)
    │
    └── styles/
        └── globals.css            # Tailwind v4 import + @theme design tokens + base/utility layers
```

## 3. Responsibility of Every Folder

- **`api/`** — Owns all HTTP transport concerns: the configured Axios
  instance, interceptors (auth header injection, 401 → refresh-token
  retry), and the map of API URL paths. Nothing here knows about React.

- **`assets/`** — Static, imported-by-reference files: images, icon
  sources not covered by `react-icons`, and any self-hosted font files.

- **`components/common/`** — Presentational, feature-agnostic building
  blocks. A component belongs here if it has no idea what a "Patient"
  or "Medicine" is. One folder per component, `Component.jsx` +
  `index.js` barrel, optional `.test.js`.

- **`components/layout/`** — The persistent app chrome (sidebar,
  navbar, footer, breadcrumb) that wraps every authenticated page via
  `DashboardLayout`.

- **`components/<feature>/`** (`dashboard/`, `medicine/`, `patient/`,
  `prescription/`) — Composite components that *do* know about
  domain concepts (e.g. a `MedicineCard`, a `PatientVitalsChart`) but
  are still reusable across more than one page within that feature.
  Feature-specific one-off layout code stays in the page itself.

- **`context/`** — React Context providers for genuinely global,
  cross-cutting client state. Currently `AuthContext` only; a future
  `ThemeContext` belongs here too. Server data does **not** belong in
  Context — that's React Query's job.

- **`helpers/`** — Reserved for cross-cutting logic that isn't a pure
  function (e.g. something that needs a browser API in a non-hook way).
  In practice, prefer `utils/` first; this folder exists per the brief
  but should stay close to empty.

- **`hooks/`** — Custom hooks that wrap Context, browser APIs, or
  local UI state (`useAuth`, `useDebounce`, `usePagination`,
  `useModal`). Feature-specific data-fetching hooks (e.g.
  `useMedicines`) are added here as each module is built, per
  `Agent.md` §3.

- **`layouts/`** — Route-level page shells rendered by React Router via
  `<Outlet />`. `AuthLayout` for public/unauthenticated pages,
  `DashboardLayout` for everything behind `ProtectedRoute`.

- **`pages/`** — One folder per module, one file per screen. Pages
  assemble layout + feature components + hooks; they hold no business
  logic themselves. Grouped by module to mirror the sidebar navigation.

- **`routes/`** — `AppRoutes.jsx` is the single route table (all pages
  lazy-loaded for code splitting); `ProtectedRoute`/`PublicRoute` are
  the two route guards used throughout.

- **`service/`** — The only layer permitted to import `axiosInstance`.
  One file per module, plain async functions, no React. Hooks call
  these; components never do.

- **`utils/`** — Pure, dependency-light helpers with no React and no
  side effects (except `storage.js`, which is an intentional, isolated
  wrapper around `localStorage`). Constants, formatters, validators,
  and generic helpers all live here.

- **`styles/`** — `globals.css` is the single stylesheet: it imports
  Tailwind v4 and declares every design token via `@theme` (see
  `Design.md`), plus a small base/utility layer for focus states and
  reduced-motion handling.

## 4. Routing Map (as implemented in `AppRoutes.jsx`)

| Path | Guard | Layout | Page | Status |
|---|---|---|---|---|
| `/login` | `PublicRoute` | `AuthLayout` | `Login` | ✅ implemented |
| `/` , `/dashboard` | `ProtectedRoute` | `DashboardLayout` | `Dashboard` | 🧩 placeholder |
| `/medicines` | `ProtectedRoute` | `DashboardLayout` | `MedicineList` | 🧩 placeholder |
| `/medicines/add` | `ProtectedRoute` | `DashboardLayout` | `AddMedicine` | 🧩 placeholder |
| `/medicines/:id/edit` | `ProtectedRoute` | `DashboardLayout` | `EditMedicine` | 🧩 placeholder |
| `/patients` | `ProtectedRoute` | `DashboardLayout` | `PatientList` | 🧩 placeholder |
| `/patients/add` | `ProtectedRoute` | `DashboardLayout` | `AddPatient` | 🧩 placeholder |
| `/patients/:id` | `ProtectedRoute` | `DashboardLayout` | `PatientDetails` | 🧩 placeholder |
| `/prescriptions/add` | `ProtectedRoute` | `DashboardLayout` | `AddPrescription` | 🧩 placeholder |
| `/prescriptions/history` | `ProtectedRoute` | `DashboardLayout` | `History` | 🧩 placeholder |
| `/settings` | `ProtectedRoute` | `DashboardLayout` | `Settings` | 🧩 placeholder |
| `/profile` | `ProtectedRoute` | `DashboardLayout` | `Profile` | 🧩 placeholder |
| `*` | — | — | `NotFound` | ✅ implemented |

Every route above already resolves and code-splits correctly
(`npm run build` verified — see build output, one JS chunk per page).
Placeholders render a `PagePlaceholder` card and are ready to be
replaced feature-by-feature following `Agent.md`.

## 5. How To Run

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL to your backend
npm run dev                # start Vite dev server
npm run build               # production build (verified working)
```
