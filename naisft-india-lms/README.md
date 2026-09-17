# NAISFT India LMS

NAISFT India is a custom LMS and admission platform for safety and fire
technology training. The project is a static front end plus a Node.js/Express
API backed by Prisma and PostgreSQL.

- **Handover details, known issues and technical debt:** [HANDOFF_NOTES.md](HANDOFF_NOTES.md)
- **Production deployment:** [docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md)

---

## Project structure

```
.                          static front end (one .html file per page)
├── css/                   page stylesheets
├── js/                    page scripts
├── Assets/                images, logos, course artwork, certificate templates
├── deploy/                nginx site config, systemd unit, PM2 ecosystem file
├── docs/                  deployment and operational notes
└── server/                Express API
    ├── routes/            endpoint definitions
    ├── controllers/       request handling and business logic
    ├── middleware/        auth guards
    ├── utils/             mailer, SMS, credentials, PDF generation
    ├── prisma/            schema, migrations, seed data
    ├── scripts/           operational scripts
    └── tests/             node:test suites
```

---

## Front end

Vanilla HTML, CSS and JavaScript with no build step. Any static file server
works during development:

```bash
node local-frontend-server.js
```

This serves the project root at <http://127.0.0.1:5501>. Alternatively use
`npx serve .` or any local static server.

The front end picks its API base URL at runtime: on `localhost` or `127.0.0.1`
it targets `http://localhost:5000/api`, otherwise `${location.origin}/api`. No
configuration file needs editing to switch environments.

---

## Backend setup

```bash
cd server
npm install
cp .env.example .env          # Windows: copy .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Edit `server/.env` before starting. Only `DATABASE_URL` and `JWT_SECRET` are
required to boot; each remaining group of variables enables one feature
(email, SMS OTP, payments, uploads, admin login). `server/.env.example`
documents every variable the code reads and what happens when it is blank.

The API listens on <http://localhost:5000> with a health check at
`/api/health`.

---

## API overview

All routes are mounted under `/api`:

| Prefix | Purpose |
|---|---|
| `/auth` | Student signup, OTP verification, login |
| `/student` | Student profile, enrolments, documents |
| `/courses` | Course catalogue |
| `/applications` | Admission applications |
| `/checkout` | Course checkout and admission details |
| `/payment` | Razorpay order creation and verification |
| `/certificates` | Certificate issuance and public verification |
| `/identity-cards` | Student identity card issuance and verification |
| `/upload` | Document uploads (local disk or Cloudinary) |
| `/enquiry` | Contact and placement enquiries |
| `/franchise-enquiry` | Franchise enquiries |
| `/admin` | Admin dashboard operations |
| `/health` | Liveness check |

---

## Environment files

Real environment files are intentionally excluded from this handoff:

- `server/.env.example` — local development template
- `server/.env.vps.example` — production VPS template

Do not commit real database URLs, JWT secrets, email keys, payment keys or VPS
credentials.

---

## Tests

```bash
cd server
npm test                # unit tests, no database required
npm run test:lifecycle  # credential lifecycle, requires TEST_DATABASE_URL
```

`npm test` needs no database or API keys. `npm run test:lifecycle` requires a
**separate** database in `TEST_DATABASE_URL` — it writes and deletes records, so
never point it at production.

---

## Production notes

The static site is served from the web root by nginx; the API runs as a Node
process on `127.0.0.1:5000` behind a `/api/` reverse proxy, managed by systemd
or PM2. See [docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md) for the full
procedure and the go-live checklist in
[HANDOFF_NOTES.md](HANDOFF_NOTES.md).
