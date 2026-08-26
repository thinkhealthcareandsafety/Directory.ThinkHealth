# Thinkhealth Hotel Database Hub — Server

PostgreSQL schema, a one-time data import script, an Express API, and real
JWT-based authentication with an owner/admin/viewer role model. The
frontend (`Thinkhealth/index.html`, `script.js`, `Style.css`, one level up
from this folder) talks to this API instead of LocalStorage. Zoho sync was
prototyped and then removed — this project uses Postgres only, no Zoho
integration.

## Status: verified locally (2026-08-14), real dataset loaded

Node.js 24 and a native PostgreSQL 17 install (not Docker — see note below)
were set up on this machine. Migrations, the CSV import, all 5 hotel
endpoints, the full frontend (search/filter/pagination/CRUD), and the
login/role system below were all exercised against a real database and a
real browser session — not just written and assumed to work. Docker was
**not** installed (Docker Desktop needs WSL2 + a reboot on this machine) —
`Dockerfile` and `docker-compose.yml` are written but unverified; they
follow the standard Node+Postgres pattern so they should work, but confirm
with `docker compose up` before relying on them for deployment.

**The database currently holds the real dataset** — 2,274 hotels imported
from the Zoho sheet export (`npm run db:import-csv`), not the 11 hand-picked
samples used earlier in development. See "Real data import" below.

## Prerequisites

- Node.js 18+ and npm
- Either: Docker Desktop (for the bundled Postgres via docker-compose,
  **unverified on this machine**, see Status above), **or** your own
  PostgreSQL 13+ instance (this is what was actually tested)

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy the env template and fill it in:
   ```
   cp .env.example .env
   ```
   - `DATABASE_URL` — if using the bundled docker-compose Postgres, use
     `postgres://thinkhealth:thinkhealth@localhost:5432/thinkhealth_hotels`
     once the `db` service is up. If using your own Postgres, use its
     connection string instead.
   - `JWT_SECRET` — signs/verifies login tokens. Generate one with:
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `JWT_EXPIRES_IN` — how long a login session lasts (default `8h`).
3. Start Postgres (skip if you're pointing at your own instance):
   ```
   docker compose up -d db
   ```
4. Run migrations:
   ```
   npm run migrate:up
   ```
5. Load the real dataset from the Zoho sheet export (CSV):
   ```
   npm run db:import-csv -- "<path-to-csv>"
   ```
   See "Real data import" below for the exact format expected and what
   this does to existing rows. (There's also `npm run db:extract` +
   `npm run db:import`, which parse the small sample array that used to
   live in `script.js` — that path is obsolete now that the real dataset
   exists, kept only for reference.)
6. Seed exactly one **owner** account (there is no public registration
   endpoint — see "Authentication" below for why):
   ```
   npm run user:create -- you@example.com "a-strong-password" owner
   ```
   From here on, don't run this script again to create more admins — the
   owner grants admin access by approving requests inside the app. This
   script is the bootstrap/escape-hatch, not the normal workflow.
7. Start the API:
   ```
   npm run dev
   ```
   It listens on `http://localhost:3000` (or `PORT` from `.env`). Open
   `Thinkhealth/index.html` in a browser (or serve that folder statically)
   — it talks to the API at `http://localhost:3000/api` by hardcoded
   constant (`API_BASE` in `script.js`); change that if you deploy the API
   somewhere else.

## Endpoints

| Method | Path                              | Auth | Notes |
|--------|-----------------------------------|------|-------|
| POST   | `/api/auth/login`                 | none | Body: `{ email, password }`. Returns `{ token, user: { email, role } }`. |
| GET    | `/api/hotels`                     | none | Paginated (`page`, `limit`, max 100/page). Filters: `search`, `star_rating`, `brand`, `city`, `state`, `hospitality_group`, `contact_status` (`present`/`missing`). Sort: `sort_by` (`name`/`star_rating`/`establishment_year`), `sort_dir` (`asc`/`desc`). |
| GET    | `/api/hotels/meta/filters`        | none | Distinct `brands`/`cities`/`states`/`hospitality_groups` values, for populating filter dropdowns from real data. |
| GET    | `/api/hotels/:hotel_id`           | none | 404 if not found or soft-deleted. |
| POST   | `/api/hotels`                     | Bearer JWT, `owner`/`admin` | 409 on duplicate `hotel_id`. |
| PUT    | `/api/hotels/:hotel_id`           | Bearer JWT, `owner`/`admin` | Partial update; send `""` on a field to clear it (used for per-contact delete). 409 only if changing to *another* hotel's existing ID. |
| DELETE | `/api/hotels/:hotel_id`           | Bearer JWT, `owner`/`admin` | Soft delete (`deleted_at`), not a real row delete. |
| POST   | `/api/access-requests`            | Bearer JWT, any role | Viewer requests to become admin. `409` if already pending, `400` if already elevated. |
| GET    | `/api/access-requests/mine`       | Bearer JWT, any role | Caller's latest request, or `null`. |
| GET    | `/api/access-requests`            | Bearer JWT, `owner` only | List requests (`?status=pending` etc). |
| POST   | `/api/access-requests/:id/approve`| Bearer JWT, `owner` only | Grants the requester `admin`. |
| POST   | `/api/access-requests/:id/deny`   | Bearer JWT, `owner` only | Marks denied; requester stays `viewer`. |

`GET /api/hotels*` routes are open, per the spec's explicit allowance for
an office-network-only deployment. **This is a decision to revisit** — if
this app is ever exposed outside the office network, GET routes need auth
too.

## Authentication & roles

**JWT, not sessions.** Chosen because the frontend is a static SPA with no
server-side rendering — a JWT bearer token needs no session store (Redis,
sticky sessions, etc.) and matches the stateless REST API shape already in
place from Phase 1.

**Three roles**: `owner` > `admin` > `viewer`.
- `owner` — full hotel CRUD, plus the only role that can approve/deny
  access requests. Meant to be exactly one person, seeded once via
  `npm run user:create -- <email> <password> owner`. There is no way to
  create a second owner except running that script again by hand — it's
  a deliberate manual step, not something the app exposes.
- `admin` — full hotel CRUD. Granted by the owner approving an access
  request, not self-service.
- `viewer` — read-only. Can submit a request to become `admin` via the
  "Request Admin Access" button; the owner sees it in the "Access
  Requests" panel and approves or denies.

**No public registration endpoint, on purpose**, at any tier — the only
way into the system is `scripts/create-user.js` (for the initial owner)
or an owner approving a request (for everyone after that). Nobody can
mint themselves elevated access through the API.

**Access-request notification**: there's no email-sending capability
configured (no SMTP/Gmail API credentials), so approval happens entirely
in-app — the owner opens the "Access Requests" panel (visible only to
them) and clicks Approve/Deny. If real email notifications are wanted
later, that needs actual mail credentials, which don't currently exist
(same situation Zoho credentials were in before that was removed).

**Audit log** (`audit_log` table): every login failure, hotel
create/update/delete, and access-request created/approved/denied is
recorded with a timestamp and the acting user's email. Passwords and
tokens are never written to it.

**Frontend**: clicking "Login" opens a modal, the returned JWT and
`{email, role}` are cached in `localStorage`. `updateAuthUI()` in
`script.js` shows/hides Add/Edit/Delete, the per-contact delete buttons,
"Request Admin Access", and "Access Requests" based on role — this is a
UI convenience only, the API enforces every check server-side regardless
of what the frontend shows or hides.

## Real data import

`scripts/import-from-csv.js` (`npm run db:import-csv -- "<path>"`) reads the
CSV exported from the Zoho sheet directly — no detour through `script.js`.

- **Expects two header rows**, matching the Zoho export layout: a section
  header row (HOTEL DETAILS / OTHER DETAILS / GENERAL MANAGER / SECURITY
  HEAD / PURCHASE MANAGER / LAST CPR TRAINING) followed by a field header
  row. Data starts on row 3. Column positions are hardcoded in the `COL`
  map at the top of the script — if the export's column order ever changes,
  update that map.
- **Every contact role (Security Head, General Manager, Purchase Manager,
  Other Details) has its own Full Name / Email / Contact Number / LinkedIn
  Profile**, per the schema — this needed a migration
  (`1700000002000_add-contact-linkedin-columns.js`) since the original
  Phase 1 schema only had a LinkedIn field on "Other Contact".
- **This is a full replace, not a merge**: the script `TRUNCATE`s the
  `hotels` table before importing. It's meant as the one-time (or
  re-run-when-the-source-changes) bootstrap load from the authoritative
  Zoho export, not an incremental sync. If you need incremental behavior
  later, that's a different script.
- Blank cells and placeholder text (`-`, `N/A`, `Not Listed`, `None`) are
  normalized to `NULL`, matching what the form/API already do.

**Last run**: 2,274 rows in the source file → 2,274 inserted, 0 skipped,
0 errors. Spot-checked against the source file directly (not just the
import's own summary output) for both the row count and specific columns.

## Verification checklist — results (2026-08-14, local Postgres 17)

**Phase 1 (API/DB):**
- [x] `npm run migrate:up` runs cleanly against a fresh database
- [x] `npm run db:import-csv` against the real 2,274-row Zoho export — all
      2,274 inserted, 0 skipped, 0 errors (verified against a direct scan
      of the source CSV, not just the script's own summary)
- [x] `POST /api/hotels` with a duplicate `hotel_id` (including
      case-insensitive `th00001` vs `TH00001`) → `409` with the exact
      message `"Hotel ID {id} already exists."`
- [x] `PUT /api/hotels/:hotel_id` without changing `hotel_id` → `200`
- [x] `PUT /api/hotels/:hotel_id` changing to another hotel's existing ID →
      `409`
- [x] `DELETE` → `204`, then `GET` on the same id → `404` (soft delete
      confirmed, `deleted_at` set rather than row removed)
- [x] Malformed JSON body → `400 {"error":"Malformed JSON body."}`, not a
      500 or stack trace
- [x] SQL injection payloads (`' OR '1'='1`, `'; DROP TABLE hotels; --`) in
      `search` → `200` with an empty result set; table row count unaffected
      (parameterized queries throughout `src/routes/hotels.js`)
- [x] XSS payload (`<script>alert(1)</script>`) in `name` → stored as inert
      text, `201`
- [x] Invalid email in a contact field → `400` with a field-specific
      validation message

**Phase 2 (frontend), tested in a real browser against the live API:**
- [x] List/detail load from Postgres, console clean
- [x] Create → edit → delete cycle, each verified by re-querying the API
- [x] Debounced search and server-side filters (star rating, brand,
      contact-status) return correct subsets

**Re-verified at real scale (2,274 rows) after the CSV import:**
- [x] Pagination: 2,274 rows → 95 pages at 24/page, Page 1 of 95 shown
      correctly, Next/Prev navigate correctly, never renders all rows at once
- [x] Search ("Taj") → 88 matches out of 2,274, correct subset
- [x] `contact_status=present` filter → 486 of 2,274, correct subset
- [x] Detail modal's 3 new LinkedIn fields (Security Head / General
      Manager / Purchase Manager) round-trip correctly through the real
      edit form → save → re-fetch via API, verified in the database
      directly, then reverted
- [x] Full-width 50/50 Edit/Delete button layout in the detail modal
      renders as a single split row (verified via computed widths, not
      just that the CSS rule exists)

**Phase 4 (auth), tested via curl and in a real browser:**
- [x] Login with correct password → JWT issued
- [x] Login with wrong password → `401`, and an `auth_failure` row is
      written to `audit_log` (email + generic reason, no password)
- [x] Viewer JWT on `POST /api/hotels` → `403`
- [x] Admin JWT on `POST /api/hotels` → `201`, and a `hotel_create` audit
      row is written with the admin's email and the new `hotel_id`
- [x] Same pattern verified for update/delete audit events
- [x] Frontend: logged-out and viewer sessions correctly hide
      Add/Edit/Delete controls; admin session shows them; full
      create→delete cycle exercised through the actual UI (not just the API)

**Owner role, access requests, dynamic filters/sort, per-contact delete
(2026-08-14), tested via a Python script driving the real API plus a real
browser session:**
- [x] Viewer blocked from hotel CRUD (`403`); admin blocked from
      `/api/access-requests` (owner-only, `403`)
- [x] Viewer submits access request → `201`; duplicate submit → `409`
- [x] Owner lists pending requests, approves → requester's `users.role`
      flips to `admin` in the database; requester logs in again and gets
      a new JWT with `role: "admin"`, and can now create hotels
- [x] Owner denies a separate request → requester stays `viewer`, still
      blocked from CRUD
- [x] Full audit trail confirmed: `access_request_created` →
      `access_request_approved`/`denied`, each with timestamp + email
- [x] Real browser: viewer sees "Request Admin Access", clicks it, button
      correctly flips to disabled "Request Pending"; owner logs in, sees
      exactly that one request in the "Access Requests" panel, clicks
      Approve, panel correctly empties
- [x] `GET /api/hotels/meta/filters` → 203 brands / 496 cities / 41
      states / 114 hospitality groups from the real data; frontend
      dropdowns populated with exactly that many options (replacing the
      old hardcoded "Accor"/"Aloft" options)
- [x] Sort by `establishment_year` `desc` → correct descending order in a
      real browser session (verified against `currentHotels`, not just
      the API response)
- [x] Per-contact delete: set Security Head fields via the real edit
      form → verified via API → clicked "Delete Contact" on that card
      through the real UI → fields correctly cleared in the DOM *and*
      confirmed cleared in the database

Everything on all lists passed on first run against real data — no fixes
were needed after writing the code, aside from two test-scripting
artifacts (not application bugs) hit while verifying: calling
`openDetailModal()`/`openEditModal()` directly on a hotel not present in
the currently-loaded page bypasses the cache those functions rely on in
normal click-driven navigation. Real users only ever reach them via a
rendered card, so this path is untestable-by-accident in the actual UI —
confirmed by redoing the same edits through a real card click, which
worked correctly both times.

**Note on Zoho**: a one-way Postgres → Zoho export sync was prototyped
(Phase 3 of the original spec) and unit-tested against a mocked API, but
was later removed entirely — this project does not integrate with Zoho.
If that's ever revisited, it would need to be rebuilt from scratch.

## Security controls

Configuration is validated once at startup (`src/config.js`). A misconfigured
environment stops the server rather than letting it serve requests with the
guard rails off — under `NODE_ENV=production`, a missing `JWT_SECRET`, a
secret under 32 characters, a missing `DATABASE_URL`, or an unset
`CORS_ORIGINS` are all fatal.

**Rate limiting** (`src/middleware/rateLimit.js`) — `POST /api/auth/login`
carries two independent limits, both of which ignore successful logins so a
person who mistypes once and then gets it right never burns budget:

| Limit | Default | Env var |
| --- | --- | --- |
| Failed logins per IP | 10 per 15 min | `LOGIN_RATE_MAX_PER_IP`, `LOGIN_RATE_WINDOW_MS` |
| Failed logins per email, across all IPs | 20 per 60 min | `LOGIN_RATE_MAX_PER_ACCOUNT`, `LOGIN_RATE_ACCOUNT_WINDOW_MS` |
| Backstop across all of `/api` | 600 per 15 min | `API_RATE_MAX`, `API_RATE_WINDOW_MS` |

Blocked attempts return `429` and write an `auth_rate_limited` row to
`audit_log`. The per-account limit means someone who knows an email address
can lock it out for the account window; that is the accepted cost of blunting
distributed credential stuffing on a small internal directory. Raise
`LOGIN_RATE_MAX_PER_ACCOUNT` if it ever bites a real user.

Counters live in memory, so they reset on restart and are per-process. That is
fine for a single instance; running more than one would need a shared store.

**CORS** — `CORS_ORIGINS` is a comma-separated allowlist. Leaving it empty
reflects any origin, which is convenient for local development and fatal in
production. Requests from an origin outside the list get `403`. Requests with
no `Origin` header (curl, server-to-server, same-origin) are allowed through;
CORS is a browser control, not an authentication one — the role checks on
every write route are what actually protect the data.

**Trust proxy** — `TRUST_PROXY` defaults to `0` (directly exposed). Behind a
load balancer or reverse proxy, set it to the number of hops, or rate limiting
will bucket every user under the proxy's IP.

**Security headers** — `helmet` is mounted app-wide. `X-Powered-By` is off.
Cross-origin resource policy is set to `cross-origin` because the frontend is
served from a different origin; CSP is disabled because this process serves
only JSON.

**Login timing** — an unknown email is compared against a throwaway bcrypt
hash so a miss costs the same work as a wrong password. Without it, response
time tells an attacker which addresses are real accounts.

**Passwords** — shared policy in `scripts/password-policy.js`, used by the
provisioning scripts, self-registration, and the password-reset OTP flow:
minimum 9 characters, and the known demo/common passwords are rejected
outright.

```
npm run user:create  -- <email> <password> <owner|admin|viewer>
npm run user:passwd  -- <email> <new-password>     # rotate, keeps the role
npm run user:passwd  -- <email> --generate         # rotate to a random one
npm run security:check                             # audit before deploying
```

`npm run security:check` reports configuration problems and any account still
using a known weak password, and exits non-zero if it finds any — usable as a
deployment gate.

### Still open

- **`GET` routes are unauthenticated by design** (office-network assumption).
  Revisit before exposing this to the public internet.
- **No HTTPS** is configured here. Terminate TLS at the proxy or platform;
  the `Strict-Transport-Security` header helmet sends only takes effect once
  the app is actually served over HTTPS.
- **`node-pg-migrate` pulls in a `glob` version with a high-severity advisory**
  (command injection via the `glob` CLI's `-c/--cmd` flag). It is a
  devDependency and that CLI is never invoked, so it does not affect the
  running server; `npm audit fix` cannot resolve it without a major bump of
  the migration tool.

## What's stubbed / not built yet

- **Docker path** — written but unverified on this machine (see Status).

## Deployment

No hosting platform has been chosen. `Dockerfile` + `docker-compose.yml`
make this portable to Render, Railway, a VPS, or any Node+Postgres host —
nothing here is platform-specific. `PORT`, `DATABASE_URL`, and `JWT_SECRET`
are the minimum a host needs to set. For anything internet-facing also set
`CORS_ORIGINS` (required in production), `NODE_ENV=production`, and
`TRUST_PROXY` to match the platform's proxy layer. Run
`npm run security:check` against the deployed database before opening it up.
