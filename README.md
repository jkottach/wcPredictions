# Kanhans FIFA 26 Predictor

Match prediction app: submit scores, earn points, view leaderboards.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Vite, Tailwind |
| API | Express, MongoDB (EC2 + nginx, or Azure Functions on SWA) |

## Project layout

```
frontend/     React app
api/          Express API + Azure Functions host
```

## Local development

```bash
# API
cd api
cp .env.example .env   # set MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID
npm install
npm run dev            # http://localhost:5001

# Frontend (proxies /api → :5001)
cd frontend
cp .env.example .env
npm install
npm run dev            # http://localhost:3000
```

### Seed data

```bash
cd api
npm run seed:mongo
```

MongoDB collections: `users`, `teams`, `matches`.

## Production

| Host | Guide |
|------|--------|
| **EC2** (recommended) | **[EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md)** + `deploy/nginx-wc26.conf` |
| Azure Static Web Apps | **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** |

## Environment

| Where | What |
|-------|------|
| Local API | `api/.env` — always loaded from `api/` (not shell cwd) |
| Local frontend | `frontend/.env` (copy from `frontend/.env.example`) |
| **Azure API** | Portal → Static Web App → **Environment variables** — see **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** |
| **Azure frontend build** | `frontend/.env.production` (committed) |

Missing Azure API env vars cause `/api/leaderboard/top` → **500**.
