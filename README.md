# Interview Full Stack Starter

Monorepo: Express + TypeScript backend, React (Vite) + TypeScript frontend, Supabase (Postgres) database. Each service has its own `Dockerfile` for deployment to Render (or AWS).

```
.
├── backend/     Express API (TypeScript) -> Supabase
├── frontend/    React + Vite (TypeScript)
├── supabase/    schema.sql to run in the Supabase SQL editor
└── render.yaml  Render blueprint (optional)
```

## 1. Supabase setup

1. Create a project at supabase.com.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Grab your Project URL and `service_role` key from Project Settings > API.

## 2. Backend

```
cd backend
cp .env.example .env   # fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
npm install
npm run dev             # http://localhost:3000
```

Build/run with Docker instead:

```
cd backend
docker build -t todo-backend .
docker run --env-file .env -p 3000:3000 todo-backend
```

## 3. Frontend

```
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3000
npm install
npm run dev             # http://localhost:5173
```

Build/run with Docker instead (API URL is baked in at build time):

```
cd frontend
docker build -t todo-frontend --build-arg VITE_API_URL=http://localhost:3000 .
docker run -p 8080:80 todo-frontend
```

## 4. Deploy to Render

Push this repo to GitHub, then in Render:

- **New Web Service** → pick the repo → set **Root Directory** to `backend`, **Environment** to Docker. Add env vars `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN` (your frontend's Render URL).
- **New Web Service** → same repo → **Root Directory** `frontend`, **Environment** Docker. Add a Docker **Build Argument** `VITE_API_URL` set to the backend service's Render URL.
- Or use the included `render.yaml` blueprint (New > Blueprint, point at this repo) and fill in the env vars it asks for.

Render's free web services sleep after 15 minutes idle — open both URLs a few minutes before you need them.

## 5. Deploy to AWS (alternative)

Both Dockerfiles are plain multi-stage builds with no Render-specific assumptions, so they also work on:

- **AWS App Runner** — point it at the repo/Dockerfile per service, simplest option.
- **Elastic Beanstalk (Docker platform)** — `eb init` / `eb create` per service using its Dockerfile.
- **ECS Fargate** — push each image to ECR, run as a Fargate service behind an ALB.

Set the same env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGIN`, `VITE_API_URL`) through whichever service's environment/secrets config.
