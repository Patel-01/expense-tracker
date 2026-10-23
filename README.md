# Interview Full Stack Starter

A todo app written in TypeScript: Express API, React (Vite) client, Supabase (Postgres) database.
The backend is organized by business capability: `src/modules/todos` owns the todo domain,
its persistence port and Supabase repository, request validation, and the HTTP controller.
`ApplicationContainer` is the composition root that creates the Supabase client and wires the
module together; nothing outside it constructs concrete adapters.

The frontend keeps application-wide composition and shared infrastructure in `client/src/app`
and `client/src/shared`, while todo-owned code lives together under `client/src/modules/todos`.
The class-based `TodoListPage` owns the list state and composes focused class components for
the header, compose form, list, and rows. `TodoApiClient` owns todo endpoints and payloads; the
shared `HttpClient` handles only transport concerns.

## Supabase setup
1. Create a project at supabase.com.
2. Run `supabase/migrations/20261023000000_init.sql` in the SQL editor (or `supabase link` + `supabase db push`).
3. Copy the Project URL and `service_role` key from Project Settings > API.

The backend uses the `service_role` key, which bypasses row-level security. It must stay on the
server; the browser only talks to the Express API.

## Run locally
1. Copy `.env.example` to `.env` and set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. `npm ci`
3. `npm run dev` (API on port 4000, Vite on http://localhost:5173 with `/api` proxied to the API).
4. `npm test` runs the unit tests. `npm run build` type-checks both backend and frontend and
   builds the production bundle.

## Run with Docker
With `.env` filled in, run `docker compose up --build`. The app is available at `http://localhost:10000`.

## Deploy to Render
Push this repository to GitHub, create a Render Blueprint from it, and provide `SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY` when prompted. The Blueprint creates one Docker web service that
serves both the API and the built client; `/healthz` is the configured health check. Free
services sleep after 15 minutes idle, so open the URL a few minutes before you need it.

## Deploy to AWS
The `Dockerfile` has no Render-specific assumptions:

- **Elastic Beanstalk (Docker platform)**: upload a zip of the repo; Beanstalk builds the
  `Dockerfile` itself, so no local Docker is needed. Set the container port to 10000.
- **App Runner or ECS Fargate**: build the image, push it to ECR, and run it from there.

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` through the service's environment or secrets config.

Endpoints: `GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`, and `GET /healthz`.
