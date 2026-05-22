# Azure Deployment: Static Web Apps + API Functions

| Layer | Azure service | Folder |
|--------|----------------|--------|
| Frontend | **Azure Static Web Apps** | `frontend/dist` |
| API | **Azure Functions** (linked) | `api/` |

SWA URL example: `https://blue-plant-0ba785610.7.azurestaticapps.net`  
API calls: `https://blue-plant-0ba785610.7.azurestaticapps.net/api/...`

---

## 1. API environment variables (fixes `/api` 500 errors)

These must be set in **Azure Portal**, not only in local `api/.env`.

1. Open [Azure Portal](https://portal.azure.com)
2. Your **Static Web App** (e.g. `blue-plant-0ba785610`)
3. **Settings** → **Environment variables** (or **Configuration**)
4. Scope: **Production** (and Preview if you use PR previews)
5. **Add** each row below (copy values from your local `api/.env`)

| Name | Value (from your `api/.env`) |
|------|------------------------------|
| `MONGODB_URI` | Full Atlas `mongodb+srv://...` string |
| `MONGODB_DB` | `fifaPrediction` |
| `JWT_SECRET` | Same as local (use a strong secret in prod) |
| `JWT_EXPIRE` | `7d` |
| `GOOGLE_CLIENT_ID` | FIFA Google Web client ID (must match `VITE_GOOGLE_CLIENT_ID`) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://blue-plant-0ba785610.7.azurestaticapps.net` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` |

6. Click **Save** / **Apply**
7. **Redeploy** (push to `dev`) or restart the app from Portal

Template (names only): see `api/.env.example`

### Do not add on Azure

| Name | Why |
|------|-----|
| `DATABASE_URL` | Old MySQL — not used |
| `PORT` | Not used on Functions |

### Verify after save

Open:

`https://blue-plant-0ba785610.7.azurestaticapps.net/api/health`

Expected:

```json
{
  "status": "ok",
  "mongo": { "ok": true, "db": "fifaPrediction" }
}
```

If `mongo.ok` is `false`, fix `MONGODB_URI` / `MONGODB_DB` or Atlas **Network Access** (allow `0.0.0.0/0` for testing).

---

## 2. Frontend build variables (Google Sign-In in the browser)

`VITE_*` variables are **baked in at build time**. They are **not** read from Azure Portal at runtime.

### Option A — GitHub Actions secret (recommended)

1. GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**: `VITE_GOOGLE_CLIENT_ID` = your FIFA Web client ID
3. Workflow already passes it into `npm run build:qa`
4. Push to `dev` to rebuild frontend

Also ensure `frontend/.env.qa` has:

```env
VITE_API_URL=/api
```

### Option B — Commit in `frontend/.env.qa`

Set `VITE_GOOGLE_CLIENT_ID=...` in `frontend/.env.qa` (client ID is public; not a secret).

---

## 3. MongoDB Atlas

- Database name: `fifaPrediction`
- Collections: `users`, `teams`, `matches`
- **Network Access**: allow Azure (or `0.0.0.0/0` for testing)

Seed (from your machine):

```bash
cd api && npm run seed:mongo
```

---

## 4. Google Cloud Console

**Authorized JavaScript origins:**

- `https://blue-plant-0ba785610.7.azurestaticapps.net`
- `http://localhost:3000`

Use the **FIFA** OAuth client — not the Kerala Election app name.

---

## 5. CI/CD

Workflow: `.github/workflows/azure-static-web-apps-blue-plant-0ba785610.yml`

GitHub secret required for deploy token:

- `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_PLANT_0BA785610`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `/api/*` → **500** | Add all API env vars in Azure (section 1); check `/api/health` |
| `/api/health` OK, leaderboard 500 | Redeploy latest `api/` code; check Application Insights / Log stream |
| Google shows wrong app name | Set `VITE_GOOGLE_CLIENT_ID` at build + matching `GOOGLE_CLIENT_ID` on API |
| Deploy “too many files” | Workflow uploads `frontend/dist` only, not `node_modules` |
