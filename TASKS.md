# Implementation Tasks

Derived from [REQUIREMENTS.md](REQUIREMENTS.md). Tasks are ordered so each one builds on
a working foundation from the last, and are sized for an intermediate developer
(a few hours to a day or two each).

## 1. Project Setup
- [x] Scaffold the backend: Node.js + Express + TypeScript project (`src/`, `tsconfig.json`, ESLint/Prettier config).
- [x] Scaffold the frontend: React + TypeScript + Tailwind CSS project (Vite recommended).
- [x] Set up PostgreSQL locally (or via Docker Compose) and create a `.env` with `DATABASE_URL`.
- [x] Install and initialize Prisma; add `schema.prisma` with the models from REQUIREMENTS.md (`User`, `DailyLog`, `SymptomLog`, `HabitLog`, `Medication`, `MedLog`).
- [x] Run the first migration (`prisma migrate dev`) and confirm tables are created.
- [x] Add a basic health-check route (`GET /api/v1/health`) to confirm the server boots and connects to the DB.

## 2. Authentication
- [x] Implement `POST /api/v1/auth/register`: validate email/password, hash password with bcrypt, create `User`.
- [x] Implement `POST /api/v1/auth/login`: verify credentials, issue a signed JWT.
- [x] Add Express middleware that reads `Authorization: Bearer <token>`, verifies the JWT, and attaches the user id to the request; reject unauthenticated requests to protected routes.
- [x] Add basic input validation and error responses (e.g. duplicate email, wrong password) using a library like `zod` or `express-validator`.
- [x] Build the frontend Login/Register forms and store the JWT (e.g. in memory + httpOnly cookie or localStorage) with an auth context/hook.

## 3. Daily Log API
- [ ] Implement `GET /api/v1/logs/today`: return the current user's log for today if one exists, else `null`.
- [ ] Implement `GET /api/v1/logs`: return logs within an optional `startDate`/`endDate` range, including nested `symptoms`, `habits`, and `medications`.
- [ ] Implement `POST /api/v1/logs`: upsert today's `DailyLog` (mood/energy/brainFog/notes) and replace/update its related `SymptomLog`, `HabitLog`, and `MedLog` rows in a single transaction.
- [ ] Write a few integration tests covering: creating a new log, updating an existing log for the same day, and fetching a date range.

## 4. Medication API
- [ ] Implement `GET /api/v1/medications`: list the current user's active medications.
- [ ] Implement `POST /api/v1/medications`: create a new medication (name, dosage, frequency).
- [ ] Implement `PATCH /api/v1/medications/:id`: edit fields or archive (`active: false`); confirm the medication belongs to the requesting user before updating.

## 5. Analytics API
- [ ] Implement `GET /api/v1/analytics/correlations`: for each habit, compute average mood/energy/brainFog on days it was logged `true` vs. `false`, and return the differences as structured data (e.g. `{ habit, avgEnergyWithHabit, avgEnergyWithoutHabit, delta }`).
- [ ] Add simple safeguards for small sample sizes (e.g. skip or flag correlations with fewer than N days of data) so early insights aren't misleading.
- [ ] Write a unit test for the correlation calculation using a fixed set of seeded logs.

## 6. Dashboard Screen (Frontend)
- [ ] Build the "How are you feeling right now?" quick-log card with large, color-coded 1-5 buttons for mood, energy, and brain fog.
- [ ] Wire the quick-log card to `GET /logs/today` (pre-fill if a log exists) and `POST /logs` (save on change).
- [ ] Build the medications + habits toggle checklist, driven by the user's active medications and previously-used habit names.
- [ ] Add a small "last 3 days" energy/brain fog micro-chart at the bottom of the dashboard.

## 7. Log Entry Screen (Frontend)
- [ ] Build the focus-mode layout: large 1-5 controls for Mood, Energy, Brain Fog with generous spacing.
- [ ] Build the Symptoms card: multi-select chips that reveal a 1-5 severity toggle when selected.
- [ ] Build the notes text area.
- [ ] Implement auto-save: debounce changes and call `POST /logs` periodically (and on field blur / navigation away) so no progress is lost.

## 8. Trends & Analytics Screen (Frontend)
- [ ] Build the 7/14/30-day filter toggle and fetch `GET /logs` for the selected range.
- [ ] Build the overlapping line chart (e.g. Mood vs. Brain Fog, Energy vs. Symptom severity) using a charting library (e.g. Recharts).
- [ ] Fetch `GET /analytics/correlations` and render the "Friendly Insights" card as plain-language bullet points generated from the correlation data.

## 9. Settings & Medication Manager Screen (Frontend)
- [ ] Build the medication list view with add/edit/archive actions wired to the medication endpoints.
- [ ] Build a simple UI for managing the custom symptom/habit list options shown on the Log Entry screen (can start as a client-stored list derived from past log entries, or a small dedicated table if time allows).

## 10. Polish & Cross-Cutting Concerns
- [ ] Add loading, empty, and error states to every screen (especially the Dashboard and Trends screens, which depend on data existing).
- [ ] Do a pass for accessibility: color contrast on the 1-5 buttons, large tap targets, keyboard navigation, and screen-reader labels — important given the target users may have brain fog or fatigue.
- [ ] Add a global API client wrapper (attach JWT, handle 401 by redirecting to login).
- [ ] Write a README with setup instructions (env vars, migrations, running both servers locally).

## 11. Deployment
- [ ] Choose a host (Vercel for frontend, Railway or Render for backend + Postgres) and document the decision.
- [ ] Set up production environment variables and run migrations against the production database.
- [ ] Deploy backend and frontend, and smoke-test the full login → log entry → trends flow in production.
