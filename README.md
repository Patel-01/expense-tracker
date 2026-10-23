# Interview Full Stack Starter

Monorepo: Express + TypeScript backend, React (Vite) + TypeScript frontend, Supabase (Postgres) database. The root `Dockerfile` builds both into one image: Express serves the API under `/api` and the React app from the same origin, so it deploys as a single Render web service.

```
.
├── backend/     Express API (TypeScript) -> Supabase
├── frontend/    React + Vite (TypeScript)
├── supabase/    migrations/ with the database schema
├── Dockerfile   Builds frontend + backend into one service
└── render.yaml  Render blueprint (optional)
```

## 1. Supabase setup

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/migrations/20261023000000_init.sql` (or `supabase link` + `supabase db push` with the CLI).
3. Grab your Project URL and `service_role` key from Project Settings > API.

## 2. Backend

```
cd backend
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev             # http://localhost:3000
```

## Docker (single service)

From the repo root:

```
docker build -t todo-app .
docker run --env-file backend/.env -p 3000:3000 todo-app   # app + API on http://localhost:3000
```

## 3. Frontend

```
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev             # http://localhost:5173
```

`backend/Dockerfile` and `frontend/Dockerfile` still exist if you'd rather deploy the two halves separately.

## 4. Deploy to Render

Push this repo to GitHub, then in Render:

- **New Web Service** → pick the repo → leave **Root Directory** empty, **Environment** Docker (uses the root `Dockerfile`), health check path `/health`. Add env vars `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Or use the included `render.yaml` blueprint (New > Blueprint, point at this repo) and fill in the env vars it asks for.

No `VITE_API_URL` or `CORS_ORIGIN` is needed: the frontend and API share one origin.

Render's free web services sleep after 15 minutes idle — open the URL a few minutes before you need it.

## 5. Deploy to AWS (alternative)

The root Dockerfile is a plain multi-stage build with no Render-specific assumptions, so it also works on:

- **AWS App Runner** — point it at the repo/Dockerfile, simplest option.
- **Elastic Beanstalk (Docker platform)** — `eb init` / `eb create` using the Dockerfile.
- **ECS Fargate** — push the image to ECR, run as a Fargate service behind an ALB.

Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` through whichever service's environment/secrets config.
