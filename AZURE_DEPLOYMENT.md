# Azure Deployment: Static Web Apps + API Functions

| Layer | Azure service | Folder |
|--------|----------------|--------|
| Frontend (React/Vite) | **Azure Static Web Apps** | `frontend/` |
| Backend (Express + MongoDB) | **Azure Functions** (linked to SWA) | `api/` |

The browser calls **`/api/*`** on the same SWA hostname. SWA proxies those requests to the Node function running the Express app.

## Architecture

```mermaid
flowchart LR
  Browser --> SWA[Static Web App]
  SWA -->|static assets| CDN[frontend/dist]
  SWA -->|/api/*| Fn[Azure Functions]
  Fn --> Express[api/src Express app]
  Express --> Mongo[(MongoDB Atlas)]
```

## CI/CD

Workflow: `.github/workflows/azure-static-web-apps-polite-bay-08b90600f.yml`

On push to `dev`:

1. Builds `frontend/dist` (`npm run build:qa`)
2. Builds `api/` (`npm run build`)
3. Deploys both to SWA (`api_location: api`)

## Azure Portal: application settings

**Static Web App → Settings → Environment variables:**

| Name | Notes |
|------|--------|
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB` | e.g. `fifaPrediction` |
| `JWT_SECRET` | Long random secret |
| `JWT_EXPIRE` | `7d` |
| `GOOGLE_CLIENT_ID` | Web client ID |
| `GOOGLE_CLIENT_IDS` | Same ID (comma-separated if multiple) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Your SWA URL |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` |

## Local development

```bash
# API (Express on :5001)
cd api && npm install && cp .env.example .env   # edit .env
npm run dev

# Frontend (Vite proxies /api → :5001)
cd frontend && npm install && npm run dev
```

**Azure Functions locally** (optional):

```bash
cd api && cp local.settings.json.example local.settings.json
npm run start:functions   # requires Azure Functions Core Tools
```

## Database

```bash
cd api
npm run seed:mongo              # teams + matches
npm run migrate:app-to-users    # one-time legacy `app` → `users`
```

Collections: `users`, `teams`, `matches`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API 404 on SWA | Confirm workflow `api_location: api` and API build step passed |
| MongoDB errors | Check `MONGODB_URI` / `MONGODB_DB` in SWA settings; Atlas IP allowlist |
| Google login | `FRONTEND_URL` + Google Console authorized origins = SWA URL |
| Local API fails | `api/.env` present; `PORT=5001` matches Vite proxy in `frontend/vite.config.ts` |
