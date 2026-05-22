# Velicham FIFA 26 Predictor

Match prediction app: submit scores, earn points, view leaderboards.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Vite, Tailwind — **Azure Static Web Apps** |
| API | Express, MongoDB — **Azure Functions** (linked to SWA at `/api`) |

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

See **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** for Static Web App settings, CI/CD, and troubleshooting.

Push to `dev` deploys via `.github/workflows/azure-static-web-apps-polite-bay-08b90600f.yml`.

## Environment

| App | File |
|-----|------|
| API | `api/.env` — see `api/.env.example` |
| Frontend | `frontend/.env` — `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID` |

Production builds use `VITE_API_URL=/api` (same origin as the static site).
