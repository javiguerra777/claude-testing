# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A wellness tracking app for people with chronic health conditions (symptom/mood/medication/habit logging with trend analytics). Full spec, data model, and API contract live in [REQUIREMENTS.md](REQUIREMENTS.md); implementation is broken into ordered, checkbox-tracked steps in [TASKS.md](TASKS.md) — check TASKS.md before starting work to see what's already done and what the next unchecked item is.

## Workflow

- Create a branch and PR per TASKS.md task rather than pushing to `master` directly (see existing PR #1 for the pattern used on the auth task).

## Architecture

Two independent npm projects, no shared workspace tooling — run commands from within `backend/` or `frontend/` respectively.

- **backend/**: Express 5 + TypeScript, Prisma ORM over PostgreSQL.
  - `src/index.ts` loads env and starts the server; `src/app.ts` builds the Express app (middleware, routes) and is imported separately so it can be exercised in tests without binding a port.
  - `src/prisma.ts` exports a single shared `PrismaClient` instance — import this rather than instantiating a new client.
  - Routes live under `src/routes/` and are mounted in `app.ts` under `/api/v1/...`. All non-public routes are protected by the `authenticate` middleware (`src/middleware/authenticate.ts`), which verifies the `Authorization: Bearer <jwt>` header and sets `req.userId` (see the `Express.Request` augmentation in that file).
  - Request bodies are validated with `zod` schemas in `src/validation/`, parsed via `.safeParse` and returned as `400` with `error`/`details` on failure — follow this pattern for new routes rather than throwing.
  - JWT signing/verification is centralized in `src/lib/jwt.ts` (`signAuthToken`/`verifyAuthToken`); it reads `JWT_SECRET` at call time and throws if unset.
  - Passwords are hashed with `bcryptjs` (`SALT_ROUNDS = 10`) in the route handler, not in a model layer.
- **frontend/**: React 19 + TypeScript + Vite + Tailwind CSS 4 (via `@tailwindcss/vite`, no `tailwind.config`).
  - `src/context/AuthContext.tsx` owns all auth state: JWT is persisted to `localStorage` (`wellness_auth_token`), current user is (re)fetched from `/me` on load/token change, and `login`/`register`/`logout` are exposed via the `useAuth()` hook. New authenticated API calls should read the token from this context rather than `localStorage` directly.
  - `VITE_API_URL` (see `.env.example`) sets the API base URL; `AuthContext` falls back to `http://localhost:4000/api/v1` if unset.
  - `App.tsx` is currently just the auth-gated shell (loading → `AuthPage` → placeholder welcome screen) — the dashboard/log/trends/settings screens described in REQUIREMENTS.md are not yet built.

## Data model

Prisma schema (`backend/prisma/schema.prisma`): `User` has many `DailyLog` and `Medication`. Each `DailyLog` is unique per `(userId, date)` and has many `SymptomLog`, `HabitLog`, and `MedLog` (the last two linking to `Medication`). All child records cascade-delete with their parent. See REQUIREMENTS.md for the full annotated schema and the intended `/api/v1` endpoint list (auth, logs, medications, analytics).

## Commands

Postgres must be running first: `docker-compose up -d` (starts `wellness_dev` on port 5432 per `docker-compose.yml`).

### Backend (`backend/`)
- `npm run dev` — start the API with hot reload (ts-node-dev), reads `backend/.env` (copy from `.env.example`: `DATABASE_URL`, `PORT`, `JWT_SECRET`)
- `npm run build` / `npm start` — compile to `dist/` and run the compiled server
- `npm run lint` — ESLint over `src/**/*.ts`
- `npm run prisma:migrate` — run/create a dev migration (`prisma migrate dev`)
- `npm run prisma:generate` — regenerate the Prisma client after schema changes
- `npm run prisma:studio` — open Prisma Studio
- No test suite is configured yet (`npm test` is a stub); TASKS.md section 3 calls for adding integration tests for the log endpoints.

### Frontend (`frontend/`)
- `npm run dev` — start the Vite dev server
- `npm run build` — typecheck (`tsc -b`) then build for production
- `npm run lint` — oxlint (config in `.oxlintrc.json`)
- `npm run preview` — preview a production build
- No test suite is configured.


## Git Workflow
1. Create a new branch named `feature/<task-number>-<brief-description>` before starting work
2. Make atomic commits with conventional commit messages:
    - feat: for new features
    - fix: for bug fixes
    - docs: for documentation
    - test: for tests
    - refactor: for refactoring
3. After completing a task, create a pull request with:
    - A descriptive title matching the task
    - A summary of changes made
    - Any testing notes or considerations
4. Update the task checkbox in TASKS.md to mark it complete.

## Testing Requirements
Before marking any task as complete:
1. Write unit tests for new functionality
2. Run the full test suite with: `npm test`
3. If tests fail:
    - Analyze the failure output
    - Fix the code (not the tests, unless tests are incorrect)
    - Re-run tests until all pass
4. For API endpoints, include integration tests that verify:
    - Success responses with valid input
    - Authentication requirements
    - Edge cases

## Test Commands
- Backend tests: `cd backend && npm test`
- Frontend tests: `cd frontend && npm test`
- Run specific test file: `npm test -- path/to/test.ts`
- Run test matching pattern: `npm test -- --grep "patern"`