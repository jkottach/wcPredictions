# Azure Deployment: Static Web Apps + API Functions

| Layer | Azure service | Folder |
|--------|----------------|--------|
| Frontend | **Azure Static Web Apps** | `frontend/dist` |
| API | **Azure Functions** (linked) | `api/` |
| Sign-in | **SWA Custom auth → Google** | `frontend/public/staticwebapp.config.json` |

SWA URL example: `https://blue-plant-0ba785610.7.azurestaticapps.net`  
Login: `/.auth/login/google`  
API calls: `https://blue-plant-0ba785610.7.azurestaticapps.net/api/...`

---

## 1. Environment variables (Azure Portal)

**Static Web App → Settings → Environment variables → Production**

| Name | Purpose |
|------|---------|
| `MONGODB_URI` | Atlas connection string |
| `MONGODB_DB` | `fifaPrediction` |
| `JWT_SECRET` | Still required (local dev / legacy JWT fallback) |
| `JWT_EXPIRE` | `7d` |
| `GOOGLE_CLIENT_ID` | Same Web client ID as Google Cloud (used by SWA auth + API) |
| `GOOGLE_CLIENT_SECRET_APP_SETTING_NAME` | **Required** — Google client secret (name matches `staticwebapp.config.json`; set in Portal when you added Google auth) |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://blue-plant-0ba785610.7.azurestaticapps.net` |
| `RATE_LIMIT_WINDOW_MS` | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | `1000` |

Save, then redeploy or restart.

Template: `api/.env.example`

### Verify API

`https://blue-plant-0ba785610.7.azurestaticapps.net/api/health` → `status: "ok"`, `mongo.ok: true`

---

## 2. Azure authentication (Google)

The app uses **Custom authentication** with Google (not the in-browser JWT button on production).

Config is in `frontend/public/staticwebapp.config.json`:

```json
"auth": {
  "rolesSource": "/api/getRoles",
  "identityProviders": {
    "google": {
      "registration": {
        "clientIdSettingName": "GOOGLE_CLIENT_ID",
          "clientSecretSettingName": "GOOGLE_CLIENT_SECRET_APP_SETTING_NAME"
      }
    }
  }
}
```

In Portal you can also set **Authentication → Custom → Google** with the same client ID and secret.

Production build sets `VITE_USE_AZURE_AUTH=true` in `frontend/.env.production`.

**User flow**

1. `/login` → **Continue with Google** → `/.auth/login/google`
2. Google redirects to Azure → `/.auth/login/google/callback`
3. App loads profile via `GET /api/auth/profile` (Azure sends `x-ms-client-principal` to the API)
4. Logout → `/.auth/logout`

**Role assignment** (`rolesSource: /api/getRoles`): after Google sign-in, Azure POSTs the user’s claims to `/api/getRoles`. The API syncs the user in MongoDB and returns:

```json
{ "roles": ["authenticated"] }
```

Use `"allowedRoles": ["authenticated"]` in `staticwebapp.config.json` for routes that require sign-in.

---


## 3. Google Cloud Console (required redirect URI)

For **Azure SWA Google**, add **Authorized redirect URIs**:

```
https://blue-plant-0ba785610.7.azurestaticapps.net/.auth/login/google/callback
```

Optional logout callback:

```
https://blue-plant-0ba785610.7.azurestaticapps.net/.auth/logout/google/callback
```

**Authorized JavaScript origins** (still useful):

```
https://blue-plant-0ba785610.7.azurestaticapps.net
http://localhost:3000
```

Use your **FIFA** OAuth client (app name e.g. “Kanhans fifa app”).

---

## 4. Local development

| Mode | How |
|------|-----|
| **JWT + Google button** (default) | `frontend/.env` with `VITE_GOOGLE_CLIENT_ID`, no `VITE_USE_AZURE_AUTH` |
| **SWA auth locally** | Install [SWA CLI](https://azure.github.io/static-web-apps-cli/) and run `swa start ./frontend/dist --api-location api` after building |

`/.auth/login/google` does **not** work with Vite alone (`npm run dev`).

---

## 5. MongoDB Atlas

- Database: `fifaPrediction`
- **Network Access**: allow `0.0.0.0/0` for testing or Azure IPs

```bash
cd api && npm run seed:mongo
```

---

## 6. CI/CD

Workflow: `.github/workflows/azure-static-web-apps-blue-plant-0ba785610.yml`  
Secret: `AZURE_STATIC_WEB_APPS_API_TOKEN_BLUE_PLANT_0BA785610`

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Google login 404 on `/.auth/login/google` | Enable **Custom** auth; redeploy with `staticwebapp.config.json` |
| Google “redirect_uri_mismatch” | Add `/.auth/login/google/callback` redirect URI (section 3) |
| Logged in at Google but API 401 | `GOOGLE_CLIENT_ID` / secret in Azure env; redeploy API |
| Instant logout after login | `JWT_SECRET` set; check Network for 401 on `/api/leaderboard/stats` |
| Popup shows host URL not app name | OAuth consent screen app name + `azurestaticapps.net` authorized domain |
