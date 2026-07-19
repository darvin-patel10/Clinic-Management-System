# Agent.md — Engineering Rules for This Codebase

This file is binding. Every future feature (Dashboard, Medicines,
Patients, Prescriptions, Settings, Profile, and anything after) **must**
follow these rules. If a change would violate a rule here, update this
file first and explain why, then make the change.

## 1. Project Identity

- Enterprise-grade **Clinic Management System**, doctors-only.
- Stack: React (latest) + Vite + Tailwind CSS v4 + React Router v7 +
  Axios + TanStack React Query + React Hook Form + Zod + Context API +
  Framer Motion + React Hot Toast + React Icons + Recharts.
- Package manager: npm. Node 18+.

## 2. Folder Structure — Do Not Deviate

```
src/
  api/            axios instance + endpoint constants only
  assets/         images, icons, fonts
  components/
    common/       generic, feature-agnostic, reusable (Button, Modal, Table…)
    layout/        shell chrome (Sidebar, Navbar, Footer, Breadcrumb)
    dashboard/     Dashboard-only composite components
    medicine/      Medicine-only composite components
    patient/       Patient-only composite components
    prescription/  Prescription-only composite components
  context/        React Context providers (Auth, future Theme)
  helpers/        cross-cutting non-pure helpers (rare — prefer utils/)
  hooks/          custom hooks (useAuth, useDebounce, usePagination, useModal…)
  layouts/        route-level layout shells (AuthLayout, DashboardLayout)
  pages/          route-level screens, grouped by module folder
  routes/         AppRoutes, ProtectedRoute, PublicRoute
  service/        one file per module — the ONLY layer that calls axios
  utils/          constants, helpers, storage, formatter, validators
  styles/         globals.css (Tailwind + design tokens)
```

Where a new file goes is not a judgment call — match it to the folder
whose responsibility it fits. If nothing fits, propose a new top-level
folder in a PR description before adding it, don't improvise inline.

## 3. Feature Build Order (per module)

For every new module (e.g. Medicines), build in this order:

1. **Schema** — Zod schema(s) for any forms, colocated in the feature's
   page or a `schema.js` file next to it. Reuse primitives from
   `utils/validators.js` where they exist.
2. **Service** — fill in the corresponding `service/*.service.js` file.
   Functions only; no React, no state. Import `axiosInstance` from
   `api/axios.js` and paths from `api/endpoints.js`.
3. **Query hooks** — wrap service calls in TanStack Query
   (`useQuery`/`useMutation`) inside a `hooks/` file scoped to the
   feature (e.g. `hooks/useMedicines.js`), using `QUERY_KEYS` from
   `utils/constants.js`. Components never call `service/` directly.
4. **Feature components** — composite, feature-specific UI in
   `components/<feature>/`, built from `components/common/` primitives.
5. **Page** — assemble the page in `pages/<Module>/`, replacing the
   `PagePlaceholder` stub. Wire loading/empty/error states using
   `Loader`, `EmptyState`, `ErrorState` from `components/common`.
6. **Route** — already scaffolded in `routes/AppRoutes.jsx`; only touch
   this file to add a genuinely new route, not to swap a placeholder for
   a real page (the route already points at the right lazy import).

## 4. Non-Negotiable Rules

- **No API calls in components.** Ever. Components → hooks → service →
  axios. This is enforced structurally; don't add `axios` or
  `axiosInstance` imports outside `service/` or `api/`.
- **Server state = React Query. Client/UI state = useState. Cross-cutting
  session state = Context.** Do not introduce Redux/Zustand/Jotai
  without updating this file first — the brief is intentionally
  Context + React Query only.
- **Every form = React Hook Form + Zod.** `zodResolver` from
  `@hookform/resolvers/zod`. No uncontrolled forms without RHF, no
  hand-rolled validation.
- **Every reusable UI element lives in its own folder** under
  `components/common/<Name>/` with `<Name>.jsx` + `index.js` barrel
  export, following the existing Button/Modal/Table pattern exactly.
- **Every list/table screen** must handle four states explicitly:
  loading (`Loader`), error (`ErrorState` + retry), empty
  (`EmptyState`), and populated. Never render "undefined" or a blank
  screen while data resolves.
- **Every page is lazy-loaded** via `React.lazy` in `AppRoutes.jsx`. Do
  not statically import a page component into the route table.
- **Absolute imports only** (`@components/...`, `@hooks/...`, etc.) —
  no `../../../` chains. Aliases are defined in `vite.config.js` and
  mirrored in `jsconfig.json`; add both together if a new alias is ever
  needed.
- **Accessibility is not optional:** every interactive control needs a
  visible focus state (inherited automatically from `globals.css`
  unless overridden — don't override it), every icon-only button needs
  `aria-label`, every form error needs `aria-describedby` wired to the
  message (see `Input.jsx` for the pattern).
- **No inline hex colors.** Use the CSS variables defined in
  `styles/globals.css` / Tailwind's arbitrary-value syntax
  (`text-[var(--color-...)]`). If a new color is genuinely needed, add
  it as a token in `globals.css` first.
- **No business logic in `pages/`.** Pages assemble; hooks and services
  compute and fetch. A page file should read like a layout, not a
  data-processing pipeline.
- **One component, one responsibility.** If a component's JSX exceeds
  ~150 lines or mixes two concerns (e.g. table + modal state), split
  it.
- **Confirm before destructive actions.** Any delete action goes through
  `ConfirmDialog`, never an immediate mutation on click.

## 5. Authentication Contract

- `AuthContext` (`context/AuthContext.jsx`) is the single source of
  truth for `user`, `isAuthenticated`, `login()`, `logout()`.
- Tokens are persisted via `utils/storage.js` under the keys in
  `STORAGE_KEYS` (`utils/constants.js`) — never touch
  `localStorage` directly outside that file.
- `api/axios.js` owns token attachment (request interceptor) and
  silent refresh-token exchange (response interceptor). On refresh
  failure it dispatches a `window` `auth:session-expired` event;
  `AuthContext` listens for it and clears the session. Don't duplicate
  this logic elsewhere.
- Auto-logout timing lives in `AUTO_LOGOUT_MS`
  (`utils/constants.js`) — change the constant, not the timer logic in
  `AuthContext`.
- `ProtectedRoute` / `PublicRoute` are the only two route guards; every
  new authenticated route goes under `ProtectedRoute` in
  `AppRoutes.jsx`, every unauthenticated route under `PublicRoute`.

## 6. Data Fetching Conventions

- Query keys live in `QUERY_KEYS` (`utils/constants.js`) — add new
  keys there, don't inline string literals in `useQuery` calls.
- Paginated lists use `usePagination` (`hooks/usePagination.js`) for
  local page/limit state, feeding `page`/`limit` into the query key so
  React Query caches per page.
- Search inputs use `useDebounce` (`hooks/useDebounce.js`) or the
  prebuilt `SearchBar` component, which already debounces internally.
- Mutations (`useMutation`) must invalidate the relevant `QUERY_KEYS`
  entry on success and surface errors via `react-hot-toast`.

## 7. Styling Conventions

- Tailwind v4, configured via the Vite plugin
  (`@tailwindcss/vite`) — there is **no** `tailwind.config.js`; theme
  tokens are declared with `@theme` in `src/styles/globals.css`. Add
  new design tokens there, not in a JS config file.
- Utility-first in JSX; extract a class combination into
  `@layer utilities` in `globals.css` only if it's reused 3+ times
  verbatim.
- Use the `cn()` helper (`utils/helpers.js`) to conditionally join
  class names — don't hand-roll template-string class logic.

## 8. What NOT To Do

- Don't add a new state-management library.
- Don't fetch data with `fetch()` or a second axios instance — always
  `api/axios.js`.
- Don't add CSS-in-JS or a second styling system alongside Tailwind.
- Don't bypass `service/` and call an endpoint string directly from a
  hook or component.
- Don't remove or weaken the auto-logout / refresh-token flow to "make
  testing easier" — gate that behind an env flag instead if needed.
- Don't hardcode route paths as string literals — import from `ROUTES`
  in `utils/constants.js`.

## 9. Definition of Done (per feature)

A module (e.g. Medicines) is done when:

- [ ] Zod schema validates all form input with inline errors.
- [ ] Service functions exist for every CRUD/read operation the module
      needs, typed by usage (JSDoc optional but encouraged).
- [ ] React Query hooks wrap every service call; mutations invalidate
      the right query keys.
- [ ] List screens show loading / error / empty / populated states.
- [ ] Destructive actions are confirmed via `ConfirmDialog`.
- [ ] All new interactive elements are keyboard-navigable with visible
      focus.
- [ ] No console errors/warnings in dev; `npm run build` succeeds.
- [ ] The `PagePlaceholder` stub for that page has been removed.
