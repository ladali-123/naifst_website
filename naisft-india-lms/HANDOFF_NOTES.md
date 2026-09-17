# NAISFT INDIA — Handoff Notes

Practical notes for the team taking over this codebase: how it fits together,
what is known to be incomplete, and what should be reviewed before further
feature work.

For setup and deployment steps see [README.md](README.md) and
[docs/VPS_DEPLOYMENT.md](docs/VPS_DEPLOYMENT.md).

---

## 1. Architecture at a glance

Two independently deployed pieces:

| Piece | What it is | Served from |
|---|---|---|
| Front end | Static HTML/CSS/JS, no build step | Web root, directly by nginx |
| API | Node.js + Express + Prisma + PostgreSQL | Node process on `127.0.0.1:5000`, reverse-proxied at `/api/` |

There is no bundler, framework, or transpiler. Pages are plain `.html` files
that load their own CSS and JS. This keeps deployment trivial (copy files) at
the cost of some duplication between pages — see §4.

**Front-end conventions**

- Each page loads a page-specific stylesheet from `css/` plus, where relevant,
  a page-specific script from `js/`.
- `js/course-images.js` maps course slug / ID / title to a course image, and is
  the single source of truth for course artwork.
- The API base URL is derived at runtime: `localhost`/`127.0.0.1` targets
  `http://localhost:5000/api`, anything else uses `${location.origin}/api`.

**Back-end conventions**

- `server/routes/*` defines endpoints, `server/controllers/*` holds the logic,
  `server/utils/*` holds shared helpers.
- `server/index.js` exports the Express app and only calls `listen()` when run
  directly, so tests can import it without binding a port.
- Credential logic (certificates, identity cards) lives in
  `server/utils/credentials.js` and is covered by tests.

---

## 2. Known issues

These are real and currently unresolved. None of them block deployment of the
main site, but they should be triaged before further feature work.

### 2.1 Two unlinked legacy pages — `blog.html`, `franchise-enquiry.html`

Both pages are currently unlinked: nothing in the site points to either of
them. They appear to have been superseded by newer page flows.

They also carry three defects:

1. They reference `.page-hero` styles that **do not exist in any stylesheet**,
   so their hero sections render unstyled.
2. Their blog card styles exist in `css/style.css` only inside media queries,
   so the article list is unstyled at desktop widths.
3. Their forms use `class="ajax-form"`, which is handled by `js/main.js`. That
   handler **does not submit anything** — it waits 800 ms, shows "Submitted
   Successfully", and resets the form. Any data entered is silently discarded.

The working franchise enquiry form is the `#franchise-enquiry` section inside
`franchise.html`, which posts to `/api/franchise-enquiry` via `js/franchise.js`.

**Recommended action:** decide whether to delete these two pages or finish them.
If they are kept, the `ajax-form` handler must be replaced with a real submit
before they are linked anywhere, or the site will lose leads.

### 2.2 `gallery.html` is unreachable

`gallery.html` is complete and styled, but no active page links to it — the
current header has no Gallery item. It was previously reachable only from the
two legacy pages in §2.1.

**Recommended action:** add Gallery to the primary navigation, or retire the page.

### 2.3 `MAIL_FROM` is documented but unused

`server/.env.vps.example` lists `MAIL_FROM`, but `server/utils/mailer.js`
hardcodes the sender as `NAISFT INDIA <admissions@naisftindia.com>`. Changing
the sender today means editing `mailer.js`.

### 2.4 Admin password fallback

`server/routes/admin.js` falls back to the password `Admin@12345` when neither
`ADMIN_PASSWORD_HASH` nor `ADMIN_PASSWORD` is set. This fallback is correctly
refused when `NODE_ENV=production`, but it does mean **production will have no
working admin login until one of those variables is set**. Set
`ADMIN_PASSWORD_HASH` before go-live.

---

## 3. Deferred cleanup items

### 3.1 Stylesheet override layers

`css/home.css` (~2,500 lines) is structured as a base layer followed by several
rounds of appended overrides. Some selectors are redefined many times
(`.main-nav` ~19 times, `.brand-logo` ~17, `.nav-wrap` ~10), with media queries
interleaved between the definitions.

This works, but it means a change to the header can require editing several
places, and the *last* definition is not always the effective one at every
breakpoint.

**If you consolidate this**, do it one breakpoint at a time with before/after
screenshots at 1440 / 1180 / 900 / 680 / 375 px. Merging two base rules can
silently change what an intervening media query overrides. This consolidation
was deferred to avoid regressions during handoff.

### 3.2 Duplicated stylesheets

There are two generations of site stylesheet:

- `styles.css` (repo root) — loaded by 5 pages:
  `about-naisft-india`, `affiliation-approvals`, `mission-vision`,
  `our-history`, `our-leadership`
- `css/style.css` — loaded by the rest

They are **not** identical, so neither can simply be deleted. The same applies
to `about.css` / `css/about.css` and `about.js` / `js/about.js`. Consolidating
requires diffing the pairs and confirming which rules each page depends on.

The retired `.hamburger` / `.nav-links` header rules have been removed after a
reference check confirmed the current pages use `.menu-toggle` / `.main-nav`.

### 3.3 Repeated header and footer markup

The header and footer are duplicated across ~23 pages. This is an accepted
trade-off of a no-build static site: it keeps pages independently servable and
avoids a flash of unstyled navigation. If it is ever templated, prefer a build
step over client-side rendering so the markup stays in the initial HTML for SEO.

### 3.4 Inline font declarations

`apply-online.html` sets `font-family` on ~111 individual rules rather than
relying on inheritance. Harmless but verbose; safe to simplify with visual
checks.

### 3.5 Asset naming

Several course images use uppercase names with spaces, ampersands and spelling
errors (e.g. `DIPLOM IN OIL AND GAS SAFTEY ENGINEERING ..webp`). One asset,
`Mohammad Salman – Chairman & Founder, NAISFT INDIA.png`, contains an en-dash
and a comma, which is fragile on some servers and CDNs.

Renaming is **not** a drop-in change: `js/course-images.js` maps courses to
these exact filenames, so any rename must be applied there in the same commit.

---

## 4. Unreferenced assets

Roughly 89 MB of the 141 MB in `Assets/` is not referenced by any page. Almost
all of it is the source `.png` for a `.webp` that *is* used — that is, the
originals for the optimised web images.

These files have been kept because several `.png` assets are the only
high-resolution masters, including the chairman portrait, the full-resolution
logo, and certificate templates. Removing them shrinks the repo but discards
the originals. Decide explicitly whether the masters belong in this repo or in
the client's asset archive.

`Assets/NAISFT-certificate-template.svg` embeds a 2.4 MB base64 image, which is
why that single file is large.

---

## 5. Testing

```bash
cd server
npm test              # unit tests, no database required
npm run test:lifecycle  # end-to-end credential lifecycle, needs TEST_DATABASE_URL
```

`npm test` needs no database and no API keys. Last verified run:

```
tests 9 | pass 8 | fail 0 | skipped 1
```

The skipped test is `credential-lifecycle`, which self-skips by design. It runs
only when `NODE_ENV=test` **and** `DATABASE_URL` points at `localhost`,
`127.0.0.1` or `::1`:

```js
configured = process.env.NODE_ENV === 'test'
  && ['localhost', '127.0.0.1', '::1'].includes(database.hostname);
```

That guard exists so a destructive test can never run against a remote or
production database. Keep it.

`npm run test:lifecycle` drives the same scenario through
`scripts/run-lifecycle-tests.js`, which reads `TEST_DATABASE_URL`. Point it at a
**separate** database only; it writes and deletes records.

Note that `npm install` in `server/` produces roughly 220 MB of
`node_modules`. It is git-ignored, but remember to exclude it if the handoff is
delivered as a zip or folder copy rather than a repository.

---

## 6. Before going live

- [ ] Set `ADMIN_PASSWORD_HASH` — admin login does not work in production without it
- [ ] Set `JWT_SECRET` to a fresh random value, minimum 32 characters
- [ ] Set `RESEND_API_KEY`, or every email-sending path will throw
- [ ] Set Razorpay live keys; checkout is disabled without them
- [ ] Set Twilio credentials, or signup OTP delivery fails
- [ ] Clear `CHECKOUT_DEV_OTP` so the fixed development OTP is not accepted
- [ ] Confirm `server/.env` is present on the VPS and not in version control
- [ ] Decide the fate of `blog.html` and `franchise-enquiry.html` (§2.1)
- [ ] Decide whether Gallery should be linked from the navigation (§2.2)
