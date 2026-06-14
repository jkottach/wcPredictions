# EC2 deployment checklist

Full step-by-step guide: **[README.md](./README.md#ec2-deployment-from-scratch)**.

## Quick checklist

- [ ] EC2 Ubuntu 22.04 + Elastic IP + security group (22, 80, 443)
- [ ] Install Node 18+, nginx, pm2, mongosh, mongoimport
- [ ] MongoDB Atlas cluster + EC2 IP whitelisted
- [ ] Google OAuth Web client (origins: production URL + `http://localhost:3000`)
- [ ] Clone repo to e.g. `/var/www/predictions`
- [ ] `api/.env` — MongoDB, JWT, Google, `FRONTEND_URL`
- [ ] `frontend/.env.production` — `VITE_GOOGLE_CLIENT_ID`, `VITE_API_URL=/api`
- [ ] Seed: `./deploy/seed-from-export.sh` or `cd api && npm run seed`
- [ ] Build: `npm ci && npm run build` in `api/` and `frontend/`
- [ ] pm2: `pm2 start api/dist/server.js --name wc26-api && pm2 save && pm2 startup`
- [ ] nginx: copy `deploy/nginx.conf.example`, set domain + `root` path
- [ ] TLS: `sudo certbot --nginx -d your.domain.com`
- [ ] DNS A record → Elastic IP
- [ ] Promote first admin in MongoDB (`role: "admin"`)
- [ ] Verify: `curl https://your.domain.com/api/health`

## Redeploy

```bash
./deploy/deploy.sh
```

## nginx configs in this repo

| File | Use when |
|------|----------|
| `deploy/nginx.conf.example` | **Recommended** — nginx serves `frontend/dist`, proxies `/api` |
| `deploy/nginx-wc26.conf` | Same layout (legacy example with hardcoded domain) |
| `deploy/nginx-wc26-pm2.conf` | Both API (pm2 :5001) and frontend (pm2 vite preview :3000) |

See [README troubleshooting](./README.md#troubleshooting) for common errors.
