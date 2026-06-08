# EC2 deployment (wc26.kanhans.com)

Run the **Express API** and **static frontend** on one EC2 instance behind nginx.  
No Azure Static Web Apps or Azure Functions required.

| Layer | On EC2 |
|-------|--------|
| Frontend | `frontend/dist` served by nginx |
| API | `node api/dist/server.js` on port **5001** (use pm2) |
| Sign-in | Google button → `POST /api/auth/google` → JWT in localStorage |

---

## 1. API environment (`api/.env` on the server)

```env
PORT=5001
NODE_ENV=production

MONGODB_URI=mongodb+srv://...
MONGODB_DB=wc26Prod

JWT_SECRET=<long-random-secret-same-for-all-instances>
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=<same as VITE_GOOGLE_CLIENT_ID in frontend build>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>

FRONTEND_URL=https://wc26.kanhans.com

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**After changing `JWT_SECRET`**, every user must sign in again (old tokens return `Invalid token`).

---

## 2. Build on the server

```bash
cd /var/www/wc26   # or your clone path

# API
cd api
npm ci
npm run build

# Frontend (uses frontend/.env.production — VITE_API_URL=/api)
cd ../frontend
npm ci
npm run build
```

`frontend/.env.production` should keep:

```env
VITE_API_URL=/api
VITE_USE_AZURE_AUTH=false
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Same-origin `/api` works because nginx proxies to Node.

---

## 3. Run API with pm2

```bash
cd /var/www/wc26/api
pm2 start dist/server.js --name wc26-api
pm2 save
pm2 startup
```

Verify: `curl http://127.0.0.1:5001/api/health`

---

## 4. nginx

Copy `deploy/nginx-wc26.conf`, set `root` to your `frontend/dist` path, enable the site, reload nginx.

**Important:** the config forwards `Authorization`, `X-Access-Token`, and `Cookie`. Without these, `/api/predictions` returns **Invalid token** even when the user is logged in.

Verify on EC2:

```bash
sudo grep -E "Authorization|X-Access-Token" /etc/nginx/sites-enabled/*
```

Compare `JWT_SECRET` length (no hidden spaces/newlines):

```bash
grep JWT_SECRET /var/www/wc26/api/.env | wc -c   # adjust path
```

TLS:

```bash
sudo certbot --nginx -d wc26.kanhans.com
```

---

## 5. Google Cloud Console

**Authorized JavaScript origins:**

```
https://wc26.kanhans.com
http://localhost:3000
```

`GOOGLE_CLIENT_ID` in `api/.env` must match `VITE_GOOGLE_CLIENT_ID` in the frontend build.

---

## 6. MongoDB Atlas

- Database: `wc26Prod` (or your `MONGODB_DB`)
- **Network Access**: allow the EC2 instance public IP (or `0.0.0.0/0` for testing)

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **`Invalid token` on `/api/predictions`** (same `JWT_SECRET`) | Usually a **stale `auth_token` cookie** or **nginx not forwarding** `Authorization` / `X-Access-Token`. Fix nginx headers (below), sign out, clear site cookies, sign in again. Opening `/api/predictions` in the browser tab alone will only send the cookie — test from the app or with `curl -H "Authorization: Bearer …"`. |
| Login works, predictions 401 | nginx missing `proxy_set_header Authorization` / `X-Access-Token` |
| Google `origin_mismatch` | Add `https://wc26.kanhans.com` to OAuth JavaScript origins |
| API 502 | pm2 not running or wrong `PORT` |
| Empty matches | `MONGODB_DB` must be `wc26Prod` (not empty `kanhans_fifa26`) |
| CORS errors | Set `FRONTEND_URL=https://wc26.kanhans.com`; API uses `cors({ origin: true, credentials: true })` |

---

## DNS

Point `wc26.kanhans.com` A record to the EC2 elastic IP. Remove or disable old Azure Static Web App binding if you no longer use it.
