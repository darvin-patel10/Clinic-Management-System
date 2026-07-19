# Agent Prompts — Build the Clinic Management System Step by Step

How to use this: give these prompts to your coding agent **one at a
time**, in order. Wait for each step to finish, review/run the app, then
move to the next. Every prompt tells the agent to follow `Agent.md` —
don't skip that reference, it's what keeps every feature consistent
with the foundation already built.

Paste each prompt as-is. Where you see `[ ... ]`, fill in your own
detail (e.g. real field names, backend URL) if you have specifics —
otherwise leave it and let the agent make sensible assumptions.

---

## Step 0 — Orientation (run once, first)

```
Read Agent.md, Design.md, and ProjectStructure.md in full before doing
anything else. Then read the existing src/ folder to understand what's
already implemented (auth flow, layouts, routing, common components).

Confirm back to me in a short list:
1. What's already built and working
2. What the build order will be for each remaining feature (per
   Agent.md §3)
3. Any gaps or ambiguities in Agent.md you want me to clarify before
   you start building

Do not write any code yet — this step is orientation only.
```

---

## Step 1 — Backend contract / mock API

```
Before building any feature UI, set up a way to develop against real
data. 

If I have a backend already running: I'll give you the base URL and
you should confirm the actual response shapes for /auth/login,
/dashboard/stats, /medicines, /patients, /prescriptions by hitting the
endpoints, then update src/api/endpoints.js and any Zod schemas to
match reality.

If I do NOT have a backend yet: set up MSW (Mock Service Worker) so
every service function in src/service/ has a realistic mock response
during development. Seed realistic sample data (10-15 patients, 15-20
medicines, a handful of prescriptions) that matches the fields
described in the original project brief (patients, medicines,
prescriptions with multiple medicines/dosage/instructions).

Tell me which path you're taking and confirm before proceeding.
```

*(Answer the agent's question about backend vs. mock before it continues.)*

---

## Step 2 — Medicines module

```
Implement the Medicines module end to end, following the build order
in Agent.md §3 exactly (Schema → Service → Query hooks → Feature
components → Page → remove placeholder).

Requirements from the project brief:
- Add Medicine (name, category, quantity/stock, unit price, expiry
  date, [add any other fields you think a clinic needs])
- Update Medicine
- Delete Medicine (must go through ConfirmDialog per Agent.md)
- Search (use the existing SearchBar component)
- Pagination (use the existing usePagination hook + Pagination
  component)
- Filtering (by category and/or low-stock status)

Fill in src/service/medicine.service.js, add query hooks in
src/hooks/useMedicines.js, build feature components in
src/components/medicine/, and replace the placeholder in
src/pages/Medicine/. Wire up the routes that already exist in
AppRoutes.jsx (medicines, medicines/add, medicines/:id/edit) — don't
change the route paths.

Follow the Definition of Done checklist in Agent.md §9 before telling
me it's finished.
```

---

## Step 3 — Patients module

```
Implement the Patients module end to end, following the same build
order as the Medicines module (Agent.md §3).

Requirements from the project brief:
- Add Patient (name, age/DOB, gender, contact number, address,
  [medical history / allergies if you think it's relevant for a
  doctor-facing tool])
- Edit Patient
- Delete Patient (through ConfirmDialog)
- Search
- Patient Details page — should show the patient's info plus their
  prescription history (you can stub the prescription history section
  with a "coming soon" note for now since Prescriptions isn't built
  yet; we'll wire it up in Step 4)

Fill in src/service/patient.service.js, add query hooks in
src/hooks/usePatients.js, build feature components in
src/components/patient/, and replace the placeholders in
src/pages/Patient/. Use the existing routes (patients, patients/add,
patients/:id) — don't change the paths.

Follow the Definition of Done checklist in Agent.md §9 before telling
me it's finished.
```

---

## Step 4 — Prescriptions module

```
Implement the Prescriptions module end to end, following the same
build order (Agent.md §3). This is the most complex module — take your
time on the form.

Requirements from the project brief:
- Add Prescription: select a patient, then add multiple medicines to
  one prescription, each with its own quantity, dosage, and
  instructions (this needs a dynamic field array in React Hook Form —
  use useFieldArray)
- Prescription History: a searchable/paginated list of past
  prescriptions, filterable by patient

After this is done, go back to the Patient Details page from Step 3
and wire the real prescription history into it (replace the "coming
soon" note with actual data for that patient).

Fill in src/service/prescription.service.js, add query hooks in
src/hooks/usePrescriptions.js, build feature components in
src/components/prescription/, and replace the placeholders in
src/pages/Prescription/. Use the existing routes
(prescriptions/add, prescriptions/history).

Follow the Definition of Done checklist in Agent.md §9 before telling
me it's finished.
```

---

## Step 5 — Dashboard module

```
Now that Medicines, Patients, and Prescriptions have real data, build
the Dashboard — it aggregates data from the other three modules, so it
makes sense to build it last.

Requirements from the project brief:
- Statistics Cards (total patients, total medicines, prescriptions
  this month, low-stock medicine count — use the existing Card
  component)
- Charts (use Recharts — a bar or line chart for monthly revenue, and
  something simple for e.g. prescriptions per week)
- Recent Patients (last 5, linking to Patient Details)
- Recent Prescriptions (last 5, linking to the relevant patient)
- Low Stock Medicines (list of medicines under a threshold, linking to
  Medicines)
- Monthly Revenue (derive this from prescription/medicine data — tell
  me what calculation you're using if the backend doesn't already
  provide a revenue figure)

Fill in src/service/dashboard.service.js, add a query hook (e.g.
useDashboardStats), build feature components in
src/components/dashboard/ (keep each stat card / chart / list as its
own small component, not one giant Dashboard.jsx), and replace the
placeholder in src/pages/Dashboard/Dashboard.jsx.

Follow the Definition of Done checklist in Agent.md §9 before telling
me it's finished.
```

---

## Step 6 — Profile & Settings

```
Implement the Profile and Settings pages.

Profile:
- View/edit the logged-in doctor's own info (name, email, specialty,
  contact number, profile photo)
- Change password form (separate from the main profile form)

Settings:
- Whatever makes sense for a clinic app's settings — at minimum: theme
  preference (if you want to lay groundwork for the "Theme (future)"
  context mentioned in Agent.md, that's optional — don't build a full
  theme system, just leave the toggle wired to local state if you add
  it), and notification preferences.
- Keep this simple; this is the lowest-priority module.

Follow the same build order and Definition of Done checklist as the
previous modules. Replace both placeholders in src/pages/Profile/ and
src/pages/Settings/.
```

---

## Step 7 — Cross-cutting QA pass

```
Do a full pass over the whole app, not just the module you just built.
Check:

1. Every list screen (Medicines, Patients, Prescriptions, Dashboard's
   recent lists) correctly shows loading / error / empty / populated
   states — actually trigger each state and verify, don't just assume.
2. Every delete action goes through ConfirmDialog with no exceptions.
3. Every form shows inline validation errors and disables its submit
   button while submitting.
4. Keyboard navigation: tab through the Sidebar, a list page, and a
   form page — confirm every interactive element has a visible focus
   ring and nothing is a keyboard trap.
5. Run npm run build and fix any warnings or errors.
6. Run through Agent.md's "What NOT To Do" list (§8) and confirm none
   of those anti-patterns crept in anywhere across the modules you
   built.

Give me a short report of what you checked and fixed.
```

---

## Step 8 — (Optional) Polish pass

```
Now that every module works functionally, do one design polish pass
guided by Design.md:

1. Compare each page against the design tokens in Design.md — flag
   and fix any place a raw hex color, off-scale spacing, or
   inconsistent border-radius crept in.
2. Add loading skeletons instead of the plain spinner on the Dashboard
   stat cards and the Medicines/Patients tables, since those are the
   highest-traffic screens.
3. Double check responsive behavior at 375px, 768px, and 1440px widths
   for the Dashboard, a list page, and a form page.
4. Re-run npm run build and confirm bundle sizes are reasonable (no
   single page chunk should balloon past ~150kb gzipped without a good
   reason — flag it to me if one does).
```

---

## Tips for using these prompts

- **Don't skip Step 0.** It costs almost nothing and prevents the agent
  from re-deriving conventions that are already decided.
- **Run the app after every step.** `npm run dev` and click through the
  new module before moving on — it's much cheaper to catch a wrong
  assumption (e.g. wrong field names) after one module than after four.
- **If a step's output doesn't match what you expected**, don't move to
  the next step — send a follow-up in the same step first, e.g. "the
  Add Medicine form is missing a manufacturer field, add it and update
  the Zod schema."
- **Steps 2-4 (Medicines, Patients, Prescriptions) are independent of
  each other** except that Prescriptions needs Patients and Medicines
  to exist first (it references both). You could reorder Medicines/
  Patients relative to each other, but keep Prescriptions after both,
  and keep Dashboard last since it aggregates all three.
