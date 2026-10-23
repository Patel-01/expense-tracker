# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Single npm package at the repo root.

```
npm run dev        # tsx watch API (port 4000) + Vite (5173, proxies /api and /healthz to 4000)
npm run build      # tsc server -> dist/, tsc client (type check only), vite build -> client/dist/
npm start          # node dist/server.js (serves API and client/dist)
npm test           # compiles via tsconfig.test.json into dist-test/, runs node --test
npm run typecheck
docker compose up --build   # http://localhost:10000
```

`npm test` runs an explicit list of compiled test files. When you add a `*.test.ts`, also add its `dist-test/...js` path to the `test` script, or it won't run. To run one test file: `npx tsc -p tsconfig.test.json && node --test dist-test/modules/todos/services/TodoMutationPolicy.test.js`.

## Architecture

The layout mirrors github.com/Patel-01/smart-audit-pipeline. Keep new code consistent with it.

**Backend (`src/`)** is organized by module. Each module under `src/modules/<name>/` has:
- `domain/`: plain types (camelCase, `Date` objects).
- `models/`: the persisted row shape (snake_case, matching `supabase/migrations`) and the table name.
- `ports/`: the store interface. The controller depends on this, never on Supabase.
- `repositories/`: the Supabase adapter implementing the port. It maps rows to the domain with `toDomain`. It uses `.maybeSingle()` or checks returned rows so that a missing ID becomes `null`/`false`, which the controller turns into a 404.
- `services/`: a public policy class (e.g. `TodoMutationPolicy`) that delegates to `services/internal/` (a planner interface plus a default implementation). The planner validates IDs and payloads and rejects unknown fields, so clients can't set `id` or `created_at`.
- `controllers/`: classes whose handlers are arrow-function properties. Each handler wraps its work in try/catch and passes errors to `next(error)`.

`src/application/ApplicationContainer.ts` is the composition root. It creates the Supabase client (service_role key, which bypasses RLS) and is the only place that constructs concrete adapters. Routes are registered explicitly in `src/server.ts`, followed by static `client/dist`, an SPA fallback, and the error handler. Register API routes before the `app.get('*')` fallback. Throwing `RequestValidationError` (in `src/shared/errors/`) produces a 400. Errors carrying a 4xx `status` (e.g. JSON parse errors) keep that status. Everything else becomes a 500 with a generic message, and the real error is logged.

Backend imports use `NodeNext` resolution: relative imports need `.js` extensions. The client uses `.js` extensions too, for consistency (Vite resolves them to `.ts`/`.tsx`).

**Frontend (`client/`)** uses class components only:
- `client/src/app/`: the root composition (`TodoApp`).
- `client/src/shared/`: `HttpClient` (transport only: same-origin relative URLs, JSON, turns `{error}` responses into thrown errors), the shared `Button` (variants map to `.button-<variant>` classes in `styles.css`), and global styles.
- `client/src/modules/todos/`: `types/` (view types, `createdAt` as a string), `services/TodoApiClient` (endpoints and payloads), `pages/TodoListPage` (owns all state; optimistic toggle with rollback; `busyIds` disables rows while a request is in flight), and presentational `components/`.

There are no shared types between server and client. When the schema changes, update the migration, `models/`, `domain/`, and `client/.../types/` together. Migrations in `supabase/migrations/` are applied manually (SQL editor or `supabase db push`).

## Environment and deployment

`.env` at the root (loaded via `dotenv/config`) holds `PORT` (4000 locally; the Docker image uses 10000), `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The server throws at startup if either Supabase variable is missing. `render.yaml` deploys the root `Dockerfile` as one service with health check `/healthz`.
