# Expense Tracker

**Live app:** https://interview-fullstack-starter.onrender.com
(API: [`/expenses`](https://interview-fullstack-starter.onrender.com/expenses), health check:
[`/healthz`](https://interview-fullstack-starter.onrender.com/healthz). It's on Render's free plan,
which sleeps after 15 idle minutes, so the first request can take about a minute.)

Log expenses, filter them by category, and see what each month cost, split by food, travel, bills
and other. Written in TypeScript: Express API, React (Vite) client, Supabase (Postgres) database.

The backend is organized by business capability. `src/modules/expenses` owns the expense domain,
its persistence port and Supabase repository, request validation and the HTTP controller.
`src/modules/todos` is the starter boilerplate that came before it, and follows the same structure.
`ApplicationContainer` is the composition root that creates the Supabase client and wires the
modules together; nothing outside it constructs concrete adapters.

The frontend keeps application-wide composition and shared infrastructure in `client/src/app`
and `client/src/shared`, while expense code lives together under `client/src/modules/expenses`.
The class-based `ExpensesPage` owns the page state and composes focused class components for the
month overview, add form, category filter, entry list and pager. `ExpenseApiClient` owns the
expense endpoints and payloads, and the shared `HttpClient` handles only transport concerns.

## Supabase setup
1. Create a project at supabase.com.
2. Run each file in `supabase/migrations/` in order in the SQL editor (or `supabase link` + `supabase db push`).
   `20261023120000_expenses.sql` creates the `expenses` table plus the `expense_totals` and `expense_summary`
   functions the API uses for totals.
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

## Expense API
Mounted at both `/expenses` and `/api/expenses`. Errors are `{ "error": "message" }` (400 for bad input).

- `POST /expenses`: `{ title, amount, category, date? }`. The title is required (100 characters max). `amount` is a number > 0 with at most 2 decimals. `category` is one of `food`, `travel`, `bills`, `other`. `date` is `YYYY-MM-DD`, can't be in the future, and defaults to today in `APP_TIME_ZONE` (default `UTC`).
- `GET /expenses?category=&from=&to=&page=&limit=`: newest first. `limit` defaults to 10 (max 100). Returns `{ items, total_count, total_amount }`; the totals cover all matching expenses, not just the page.
- `DELETE /expenses/:id`: 204, or 404 if it doesn't exist.
- `GET /expenses/summary?month=YYYY-MM`: `{ month, totals: { food, travel, bills, other } }`.

Other endpoints: `GET /api/todos`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`, and `GET /healthz`.
