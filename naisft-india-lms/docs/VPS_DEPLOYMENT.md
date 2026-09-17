# VPS Deployment

Deploying NAISFT INDIA to a single Ubuntu VPS running nginx, Node.js and
PostgreSQL. The static front end is served directly by nginx; the API runs as a
Node process behind a reverse proxy on `/api/`.

Paths below assume the repo lives at `/var/www/naisft/NAISFT-INDIA`. If you use
a different path, update it in `deploy/nginx-naisftindia.conf` and in whichever
process manager you choose.

---

## 1. Prerequisites

- Ubuntu 22.04 or newer
- Node.js 18+ and npm
- PostgreSQL 14+
- nginx
- A domain pointed at the server (`naisftindia.com`, `www.naisftindia.com`)

---

## 2. Database

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE naisft_db;
CREATE USER naisft_user WITH ENCRYPTED PASSWORD 'STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE naisft_db TO naisft_user;
\q
```

---

## 3. Application

```bash
sudo mkdir -p /var/www/naisft
cd /var/www/naisft
# copy or clone the project here as NAISFT-INDIA
cd NAISFT-INDIA/server
npm ci --omit=dev
```

Create the environment file from the production template:

```bash
cp .env.vps.example .env
```

Edit `server/.env` and fill in real values. At minimum you must set
`DATABASE_URL`, `JWT_SECRET` and `ADMIN_PASSWORD_HASH` — see
[HANDOFF_NOTES.md §6](../HANDOFF_NOTES.md) for the full go-live checklist.

Generate the admin password hash:

```bash
node -e "console.log(require('bcryptjs').hashSync(process.argv[1],12))" 'YourAdminPassword'
```

Apply the schema and seed reference data:

```bash
npx prisma generate
npx prisma migrate deploy
npm run db:seed
```

> `npm start` also runs `prisma migrate deploy` before booting, so migrations
> are applied automatically on restart.

---

## 4. Run the API

Two supported options — pick one, not both.

### Option A: systemd

```bash
sudo cp deploy/naisft-api.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now naisft-api
sudo systemctl status naisft-api
```

The unit runs as `www-data` from `server/` and restarts on failure.

### Option B: PM2

```bash
sudo npm install -g pm2
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Logs are written to `/var/log/naisft-api.{out,err}.log`.

Verify either way:

```bash
curl http://127.0.0.1:5000/api/health
```

---

## 5. nginx

```bash
sudo cp deploy/nginx-naisftindia.conf /etc/nginx/sites-available/naisftindia.com
sudo ln -s /etc/nginx/sites-available/naisftindia.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

The site config handles:

- static files from the repo root
- `/api/` reverse-proxied to `127.0.0.1:5000`
- `/uploads/` proxied to the Node process (runtime uploads are not on disk in
  the web root)
- clean URLs via `try_files $uri $uri/ $uri.html`
- a 302 away from `apply-online.html` when no `token` query parameter is present
- a 20 MB request body limit, matching the API's own 15 MB JSON limit

### `.htaccess` is Apache-only

The repo also contains a root `.htaccess` implementing the same clean URLs and
the `apply-online.html` token guard. **nginx ignores it.** It is kept only for
Apache or shared hosting. If you deploy on nginx, the equivalent rules are
already in the site config — do not assume `.htaccess` is protecting anything.

---

## 6. TLS

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d naisftindia.com -d www.naisftindia.com
```

Certbot rewrites the site config to listen on 443 and redirect port 80.

---

## 7. Updating a running deployment

```bash
cd /var/www/naisft/NAISFT-INDIA
# pull or copy in the new files
cd server && npm ci --omit=dev && npx prisma migrate deploy
sudo systemctl restart naisft-api     # or: pm2 restart naisft-api
```

Static front-end changes need no restart — nginx serves them from disk, and the
config sends `Cache-Control: no-cache` for HTML.

---

## 8. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `502 Bad Gateway` on `/api/` | Node process is down — check `systemctl status naisft-api` |
| CORS error in the browser | Origin missing from the allowlist in `server/index.js` |
| Admin login always rejected | `ADMIN_PASSWORD_HASH` unset; production refuses the dev fallback |
| Emails throw on send | `RESEND_API_KEY` unset |
| Uploaded files 404 | `/uploads/` proxy missing, or `server/uploads/` not writable by `www-data` |
| Checkout unavailable | Razorpay keys unset |
