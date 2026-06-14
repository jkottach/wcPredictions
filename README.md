# Tournament Prediction Platform

A self-hosted match prediction app for companies, friend groups, or communities. Users sign in with Google, predict match scores, earn points, and compete on a leaderboard. Admins finalize results and manage users through the API.

Built for **FIFA World Cup 2026**, but the stack is generic — clone it, point it at your domain, seed your MongoDB, and run it on a single EC2 instance.

## What's included

| Component | Path | Description |
|-----------|------|-------------|
| **API** | `api/` | Express + TypeScript REST API, MongoDB, Google OAuth, JWT auth |
| **Frontend** | `frontend/` | React + Vite player app (predictions, leaderboard, profile, admin panel) |
| **Admin API** | `api/src/routes/adminRoutes.ts` | Protected endpoints for match finalization and user management |
| **Deploy scripts** | `deploy/` | nginx template, pm2 config, deploy and seed helpers |
| **Seed data** | `wc26.teams.json`, `wc26.matches.json` | MongoDB export files (48 teams + 104 matches) |

> **Admin UI:** Admins see an **Admin** link in the nav and can open `/admin` to finalize matches and manage users. Non-admins are redirected away from that route.

## Architecture

```mermaid
flowchart LR
  User[Browser] --> Nginx
  Nginx -->|"/"| Static["frontend/dist"]
  Nginx -->|"/api/*"| API["Express API :5001"]
  API --> MongoDB[(MongoDB Atlas)]
  User -->|Google Sign-In| Google[Google OAuth]
  Google --> API
```

**Production (recommended):** nginx serves the built React app and proxies `/api` to Node.js (pm2). One EC2 instance, one domain.

## Prerequisites

Before you start, create accounts and gather credentials for:

1. **MongoDB Atlas** — free tier works ([mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))
2. **Google Cloud Console** — OAuth 2.0 Web client ([console.cloud.google.com](https://console.cloud.google.com))
3. **AWS EC2** — Ubuntu 22.04 LTS, `t3.small` or larger, elastic IP recommended
4. **Domain name** — DNS A record pointing to your EC2 IP (for HTTPS)

On the EC2 instance you will install:

- **Node.js 18+** ([nodejs.org](https://nodejs.org) or [nvm](https://github.com/nvm-sh/nvm))
- **nginx**
- **pm2** (`npm install -g pm2`)
- **certbot** (Let's Encrypt TLS)
- **MongoDB Database Tools** (`mongoimport`, `mongosh`) — for seeding from JSON exports

---

## Quick start (local development)

### 1. Clone and install

Install **Git** if you do not have it yet:

```bash
# Ubuntu / Debian (EC2)
sudo apt update && sudo apt install -y git

# macOS (Homebrew)
brew install git

# Verify
git --version
```

Clone the repository and install dependencies:

```bash
git clone https://github.com/jkottach/wcPredictions.git
cd wcPredictions

cd api && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Configure environment

**API** — copy and edit:

```bash
cp api/.env.example api/.env
```

Set at minimum: `MONGODB_URI`, `MONGODB_DB`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL=http://localhost:3000`.

**Frontend** — copy and edit:

```bash
cp frontend/.env.example frontend/.env
```

Set `VITE_GOOGLE_CLIENT_ID` to the **same** Web client ID as the API.

### 3. Seed MongoDB

Choose one method:

**Option A — bundled seed script** (uses `api/scripts/data/worldCup2026.seed.json`):

```bash
cd api
npm run seed
```

**Option B — root export files** (uses `wc26.teams.json` + `wc26.matches.json` at repo root):

```bash
chmod +x deploy/seed-from-export.sh
./deploy/seed-from-export.sh
```

Both methods populate `teams` and `matches`. The `users` collection is created when people sign in.

### 4. Run locally

```bash
# Terminal 1 — API on http://localhost:5001
cd api && npm run dev

# Terminal 2 — Frontend on http://localhost:3000 (proxies /api → :5001)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Health check: [http://localhost:5001/api/health](http://localhost:5001/api/health).

---

## EC2 deployment from scratch

These steps assume Ubuntu 22.04 on EC2 and a domain like `predictions.yourcompany.com`.

### Step 1 — Launch and connect to EC2

1. Create an EC2 instance (Ubuntu 22.04, at least 2 GB RAM).
2. Attach an **Elastic IP** so the IP does not change on restart.
3. Security group inbound rules:
   - **22** (SSH) — your IP only
   - **80** (HTTP)
   - **443** (HTTPS)
4. SSH in: `ssh -i your-key.pem ubuntu@YOUR_EC2_IP`

### Step 2 — Install system dependencies

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git curl

# Node.js 20 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

sudo npm install -g pm2

# MongoDB Database Tools (for seeding)
wget -qO- https://www.mongodb.org/static/pki/server-8.0.asc | sudo tee /etc/apt/trusted.gpg.d/mongodb.asc
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt update && sudo apt install -y mongodb-mongosh mongodb-database-tools
```

### Step 3 — MongoDB Atlas

1. Create a cluster and database user.
2. Create a database (e.g. `fifaPrediction`).
3. **Network Access** → add your EC2 **Elastic IP** (or `0.0.0.0/0` temporarily for testing).
4. Copy the connection string (`mongodb+srv://...`).

### Step 4 — Google OAuth

1. Google Cloud Console → **APIs & Services** → **Credentials** → **Create OAuth client ID** → **Web application**.
2. **Authorized JavaScript origins:**
   ```
   https://predictions.yourcompany.com
   http://localhost:3000
   ```
3. Copy **Client ID** and **Client secret**.

The client ID must match in both `api/.env` and `frontend/.env.production`.

### Step 5 — Clone the repository

```bash
sudo mkdir -p /var/www/predictions
sudo chown "$USER":"$USER" /var/www/predictions
git clone https://github.com/YOUR_ORG/wc26Prediction.git /var/www/predictions
cd /var/www/predictions
```

### Step 6 — Configure API

```bash
cp api/.env.example api/.env
nano api/.env
```

Example production values:

```env
PORT=5001
NODE_ENV=production

MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=fifaPrediction

JWT_SECRET=generate-a-long-random-string-at-least-32-chars
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

FRONTEND_URL=https://predictions.yourcompany.com

TOURNAMENT_PREDICTION_DEADLINE=2026-06-18T23:59:59.000Z

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

Generate a strong JWT secret:

```bash
openssl rand -base64 48
```

### Step 7 — Configure frontend build

Edit `frontend/.env.production` **before building**:

```env
VITE_API_URL=/api
VITE_USE_AZURE_AUTH=false
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

Same-origin `/api` works because nginx proxies API requests to Node.

### Step 8 — Seed the database

```bash
cd /var/www/predictions
chmod +x deploy/seed-from-export.sh
./deploy/seed-from-export.sh
```

Or from the API seed script:

```bash
cd api && npm run seed
```

### Step 9 — Build and start with pm2

```bash
cd /var/www/predictions

cd api && npm ci && npm run build
cd ../frontend && npm ci && npm run build

# Start API only (nginx serves frontend static files — recommended)
cd /var/www/predictions/api
pm2 start dist/server.js --name predictions-api
pm2 save
pm2 startup   # run the command it prints, then pm2 save again
```

Verify the API on the server:

```bash
curl -s http://127.0.0.1:5001/api/health
```

Expected: JSON with `"status":"ok"` and `"mongo":{"ok":true,...}`.

### Step 10 — Configure nginx

```bash
sudo cp /var/www/predictions/deploy/nginx.conf.example /etc/nginx/sites-available/predictions
sudo nano /etc/nginx/sites-available/predictions
```

Update:

- `server_name` → your domain
- `root` → `/var/www/predictions/frontend/dist`

Enable and test:

```bash
sudo ln -sf /etc/nginx/sites-available/predictions /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### Step 11 — TLS (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d predictions.yourcompany.com
```

Certbot updates nginx for HTTPS automatically.

### Step 12 — DNS

Create an **A record** for your domain pointing to the EC2 Elastic IP.

Test end-to-end:

```bash
curl -s https://predictions.yourcompany.com/api/health
```

Open the site in a browser and sign in with Google.

---

## Admin setup

Admin actions use JWT-authenticated API routes under `/api/admin`. There is no public admin page on EC2 by default.

### Create your first admin

1. Sign in once through the frontend (creates a user in MongoDB).
2. In MongoDB Atlas (or `mongosh`), promote your account:

```javascript
db.users.updateOne(
  { email: "you@yourcompany.com" },
  { $set: { role: "admin" } }
)
```

3. Sign out and sign in again so the JWT includes the admin role. The **Admin** link appears in the navigation menu.

### Admin panel (`/admin`)

| Tab | Action |
|-----|--------|
| **Finalize matches** | Enter final scores — points are calculated automatically |
| **Users** | View all users, delete non-admin accounts |

The route is protected: only users with `role: "admin"` can access it.

### Admin API (optional)

All require `Authorization: Bearer <token>` from a user with `role: "admin"`.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/admin/finalize-match` | Enter final scores and calculate points |
| `GET` | `/api/admin/users` | List all users |
| `DELETE` | `/api/admin/users/:userId` | Delete a user (not admins) |
| `POST` | `/api/matches` | Create a match |
| `PUT` | `/api/matches/:matchId` | Update a match |
| `DELETE` | `/api/matches/:matchId` | Delete a match |

Example — finalize a match:

```bash
curl -X POST https://predictions.yourcompany.com/api/admin/finalize-match \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"matchId": "MATCH_OBJECT_ID", "team1Score": 2, "team2Score": 1}'
```

---

## Ongoing deployments

After the initial setup, deploy updates with:

```bash
cd /var/www/predictions
chmod +x deploy/deploy.sh   # once
./deploy/deploy.sh
```

This pulls `main`, runs `npm ci` + build for API and frontend, restarts pm2, and checks `/api/health`.

Deploy a different branch:

```bash
DEPLOY_BRANCH=dev ./deploy/deploy.sh
```

> **Note:** pm2 process name in `deploy/deploy.sh` is `wc26-api`. If you started the app as `predictions-api`, either rename it (`pm2 delete predictions-api && pm2 start api/dist/server.js --name wc26-api`) or adjust the script.

---

## Environment variables reference

### API (`api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | Yes | Database name |
| `JWT_SECRET` | Yes | Secret for signing tokens (rotate → all users re-login) |
| `JWT_EXPIRE` | No | Token lifetime (default `7d`) |
| `GOOGLE_CLIENT_ID` | Yes | Must match frontend |
| `GOOGLE_CLIENT_SECRET` | Yes | From Google Cloud Console |
| `FRONTEND_URL` | Yes | Public site URL (CORS / cookies) |
| `PORT` | No | API port (default `5001`) |
| `NODE_ENV` | No | `production` on EC2 |
| `TOURNAMENT_PREDICTION_DEADLINE` | No | ISO date when bracket picks lock |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (default 15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests per window (default 1000) |

### Frontend (`frontend/.env` local, `frontend/.env.production` EC2 build)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | `/api` for same-origin nginx proxy |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth Web client ID |
| `VITE_USE_AZURE_AUTH` | No | Set `false` for EC2 (default in `.env.production`) |

---

## MongoDB collections

| Collection | Seeded? | Contents |
|------------|---------|----------|
| `teams` | Yes | Nations (`teamId`, name, flag URL) |
| `matches` | Yes | Fixtures, scores, rounds, prediction deadlines |
| `users` | No | Created on register / Google sign-in; holds predictions and points |

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| **`Invalid token` on `/api/predictions`** | nginx missing `Authorization` / `X-Access-Token` headers — use `deploy/nginx.conf.example`. Sign out, clear cookies, sign in again. |
| **Google `origin_mismatch`** | Add your production URL to OAuth **Authorized JavaScript origins**. |
| **502 on `/api/*`** | API not running. Check `pm2 status`, `pm2 logs wc26-api --lines 50`, `curl http://127.0.0.1:5001/api/health`. Rebuild: `cd api && npm run build && pm2 restart wc26-api`. |
| **Empty matches on dashboard** | Wrong `MONGODB_DB` or seed not run. Re-run `./deploy/seed-from-export.sh` or `npm run seed`. |
| **Health check `mongo.ok: false`** | Atlas network access — whitelist EC2 IP. Verify `MONGODB_URI` in `api/.env`. |
| **CORS errors** | Set `FRONTEND_URL` to your exact public URL (including `https://`). |
| **Page reloads when switching tabs (dev)** | Do not use `npm run dev` in production. Use `npm run build` + nginx static serving. |

---

## Project layout

```
wc26Prediction/
├── api/                    Express API
│   ├── src/                Routes, controllers, MongoDB layer
│   ├── scripts/            Seed scripts + bundled JSON
│   └── .env.example
├── frontend/               React player app
│   ├── src/
│   └── .env.example
├── deploy/
│   ├── deploy.sh           Pull, build, restart pm2
│   ├── seed-from-export.sh Import wc26.*.json into MongoDB
│   ├── nginx.conf.example  Generic nginx site config
│   └── ecosystem.config.cjs
├── wc26.teams.json         Seed: 48 teams (MongoDB export)
└── wc26.matches.json       Seed: 104 matches (MongoDB export)
```

---

## License

Use and adapt for your organization. Replace Google OAuth credentials, JWT secret, and domain before going live.

For a shorter EC2-focused checklist, see [EC2_DEPLOYMENT.md](./EC2_DEPLOYMENT.md).
