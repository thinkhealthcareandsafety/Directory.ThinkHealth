# Thinkhealth Hotel Database Hub — Working Notes

Operational state of the project: the things that aren't derivable from the
code itself. Server-specific detail (endpoints, schema) lives in
[server/README.md](server/README.md) — this file is the layer above that,
and doubles as a context-transfer doc for handing this project to a fresh
conversation.

Last updated: 2026-08-26.

**Repo**: https://github.com/thinkhealthcareandsafety/Directory.ThinkHealth
(private). Pushed 2026-08-26 — `git init` done in this session, `.gitignore`
verified to exclude `server/.env` (real secrets) and the raw video source
before the first commit. `render.yaml` at the repo root is a Render
Blueprint for one-pass deploy (Postgres + API + static site) — not yet
deployed as of this writing.

---

## Layout

```
Thinkhealth/
  index.html    the directory (hero + search + filters + card grid)
  login.html    separate sign-in / sign-up page — no directory content loads here
  script.js     all directory logic (filters, cards, modals, pagination, admin panels)
  auth.js       login.html's own logic (sign-in / sign-up forms)
  config.js     shared constants (API_BASE, storage keys) + background-video loader
  combobox.js   generic searchable-dropdown widget, wraps a <select> without replacing it
  Style.css     one stylesheet for both pages
  logo.png, hero-loop.mp4, hero-loop-2.mp4, hero-poster.jpg/webp   hero media
  server/                                Node/Express + PostgreSQL API
```

No build step anywhere — open the HTML files, edit, refresh.

Frontend is static files on **port 8080**; API on **port 3000**.
`API_BASE` is hardcoded in `config.js` (shared by both pages) — change it there
for any deployment.

**Run it:**
```bash
cd "C:/Users/11/Desktop/HTML CSS/Thinkhealth/server" && npm run dev
```
```bash
cd "C:/Users/11/Desktop/HTML CSS/Thinkhealth" && python -m http.server 8080
```
Then open `http://localhost:8080` — it redirects to `login.html` if you have
no session.

## Deployment (live since 2026-08-27)

| | |
| --- | --- |
| Frontend | https://thinkhealth-hub.onrender.com |
| API | https://thinkhealth-api.onrender.com |
| Repo | https://github.com/thinkhealthcareandsafety/Directory.ThinkHealth (private) |
| Host | Render — `render.yaml` at repo root is the Blueprint (Postgres + API + static site) |

Real production data — deploy changes carefully. The 2,274 hotels and the
three real accounts above were migrated once via `pg_dump`/`\copy` from the
local dev database (excluding two test hotel rows, `TH02275` and `TH99500`,
that never should have been in the local data either).

**Case sensitivity**: this was built and tested entirely on Windows, which
is case-insensitive for filenames — Render's Linux filesystem is not. One
bug already hit from this: `index.html` referenced `style.css` while the
tracked file is `Style.css`, which 404'd silently in production only. Any
new asset reference should be checked for exact-case match against
`git ls-files`, not just "does it open locally."

**Env vars are set directly in the Render dashboard**, not in the repo —
`server/.env` (with the real Gmail SMTP password and JWT secret) is
gitignored and stays local-only. `render.yaml` deliberately leaves
`CORS_ORIGINS` and all four `SMTP_*` values as `sync: false` so they're
never accidentally committed.

## This machine

- Node.js v24.19.0 / npm 11.17.0, PostgreSQL 17 (Windows service
  `postgresql-x64-17`), psql at `C:\Program Files\PostgreSQL\17\bin\psql.exe`
- **ffmpeg** installed via winget this session, for building the hero video:
  `C:\Users\11\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe`
- **Docker not installed** — `Dockerfile`/`docker-compose.yml` exist, never run

| | |
| --- | --- |
| Superuser | `postgres` / `postgres` |
| App role | `thinkhealth` / `thinkhealth_dev_pw` |
| Database | `thinkhealth_hotels` |

## Accounts (live right now, on **production** — see Deployment below)

| Email | Role | Note |
| --- | --- | --- |
| `sjasmeet7499@gmail.com` | **owner** | the real owner account |
| `sagar.thinkhealth@gmail.com` | viewer | self-registered |
| `shikha.dixit@thinkhealth.in` | admin | |

All seeded/demo accounts (`owner@thinkhealth.com`, `admin@thinkhealth.com`,
`viewer@thinkhealth.com`, `demo@gmail.com`) were **deleted by the real owner
directly through the live Manage Users panel on 2026-08-27**, closing the
"rotate demo passwords" item by removal rather than rotation. If a working
seeded admin account is needed again for testing, recreate one with
`npm run user:create -- <email> <password> admin` against the production
`DATABASE_URL`.

## Data

2,274 live hotel rows. Contact completeness is tracked as **x/16** — four
roles (Security Head, General Manager, Purchase Manager, Other) × four fields
(name/email/phone/linkedin). 486 hotels have at least one of the 16 filled;
1,788 have none.

**Schema quirk:** the "Other Contact" role's LinkedIn column is named
`linkedin_url`, not `other_contact_linkedin` like the other three roles. Easy
to miss when touching contact-field code — grep for `linkedin_url` specifically.

**Region classification** (`server/src/regions.js`): the raw `state` column
mixes 26 Indian states, 7 Indian union territories, and 8 foreign regions
(Nepal provinces, "Greater London (UK)", etc.) — 41 distinct values total.
Classified server-side so the hero stats and filters don't lie about "how many
Indian states."

## Decisions already made — don't re-litigate

- **Zoho integration was built, then deliberately removed** (pre-dates this
  session). Postgres is the sole source of truth.
- **No email notifications** — no SMTP configured. Access-request and
  edit-request approval are in-app only.
- **`GET /api/hotels*` now requires authentication** — this was flipped this
  session. Originally open on an office-network assumption; now every
  directory page requires sign-in, reachable via `login.html`.
- **Self-registration exists** (`POST /api/auth/register`), always creates a
  **viewer** account. No public path to admin — that still only happens via
  owner-approved access requests.
- **Viewers can propose edits, not make them.** They can't write to `hotels`
  directly, but can submit a diff that an admin/owner approves or rejects
  (see "Edit-approval workflow" below). This was the last major feature built.
- **Add Hotel is admin/owner only**, verified this session at all three
  layers (UI hidden, API returns 403, nothing reaches the database).

## What was built this project (roughly chronological)

**Security hardening** — login rate limiting (per-IP and per-account), CORS
allowlist (`CORS_ORIGINS` env var, permissive only in dev), startup config
validation that refuses to boot production with a weak/missing secret,
constant-time login (no timing leak on unknown emails), `npm run
security:check` as a deployable gate, password rotation tooling.

**Login separated from the directory** — `login.html` + `auth.js` are their
own page now; `index.html` never renders without a valid session. Shared
`config.js` holds `API_BASE` and storage keys so both pages agree.

**Full visual redesign** — design-token system in `Style.css` (spacing,
radii, shadows, motion durations), sticky app bar, full-viewport hero with a
video background, redesigned hotel cards (deterministic architectural SVG
placeholder instead of emoji — hue derived from hotel ID), skeleton loaders,
empty/error states with recovery actions, list/grid view toggle.

**Filter system** — every long filter (Brand ~200, City ~500, State, Group)
is a searchable combobox (`combobox.js`) wrapping the real `<select>`, not
replacing it, so existing `change` listeners never needed touching. Panels
portal to `<body>` because the filter rail scrolls and was clipping them.
Country → State → City cascade (each narrows the next; picking a
country/state that invalidates the child selection clears it rather than
silently returning zero results). Favourites-only filter, resolved
server-side via a `hotel_ids` list param so it composes correctly with sort
and pagination instead of just slicing the current page. Contact status is
two states (`available` / `none`), not three — matches the ≥1-of-16 rule
exactly, filter and card badge can't disagree.

**Sort/pagination** — 7 sort fields as horizontal single-select pill buttons
(was a 3-option dropdown), separate Ascending/Descending pills. Jump-to-page
input (rejects out-of-range) and a 10/20/50/100 page-size selector
(persisted in localStorage).

**Hero video** — went through several source clips; currently
`hero-loop.mp4` → `hero-loop-2.mp4` play sequentially via the `ended` event
(not the `loop` attribute, which only repeats one clip), then cycle back to
clip 1. `LOGIN VIDEO.mp4` in the project root is the untouched source for
clip 1, kept for regeneration — safe to delete if disk space matters, nothing
references it. Video is skipped entirely on `prefers-reduced-motion`,
data-saver connections, and small viewports (poster image only). Blur amount
is one CSS variable: `--hero-blur` in `Style.css`.

**Registration + user management** — self-service sign-up, a `full_name`
column on `users` (so the avatar shows real initials, not the first letter of
an email), an owner-only Manage Users panel, owner accounts are immutable
through the API (can't be demoted or deleted by anyone, including another
owner — must use the CLI).

**Forgot-password (OTP)** — self-service reset, no admin involvement (this
supersedes the earlier plan to do an admin-mediated queue). New
`password_reset_otps` table (migration `1700000008000`), hashed codes only
(never the raw OTP), 6-digit code valid 5 minutes, single-use, burns itself
after 5 wrong attempts. Delivery via `src/email.js` (nodemailer) — requires
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM` in `.env`; without them the
code is logged to the server console instead (dev only — `validateConfig()`
makes missing SMTP fatal under `NODE_ENV=production`). Frontend: a third
`login.html` flow (request → verify) with a live countdown and a disabled
"Resend code" until expiry. Verified end-to-end this session against the
real `viewer@thinkhealth.com` account — see the accounts table above for its
rotated password.

**Products (on-site equipment)** — new `hotels.products` jsonb column
(migration `1700000010000`, GIN-indexed) holding an array of stable keys.
The canonical list is `PRODUCT_KEYS` in `server/src/routes/hotels.js` and
`PRODUCTS` in `script.js` — **add an item to both**; the server whitelists
against its own copy, so an unlisted key is dropped, not stored. Shown as a
tickable checklist in the detail modal above Departmental Contacts, saving
per-tick via `PATCH /api/hotels/:hotel_id/products` (admin/owner only;
viewers see it read-only). Current list: AED, Stretcher, Wheelchair, First
Aid Kit, Oxygen Cylinder, Spine Board — placeholders pending the real list.

**Upcoming properties** — `establishment_year` in the future means the hotel
hasn't opened. `GET /api/hotels?upcoming=true` filters on the *database's*
clock (not a client-supplied year), there's an "Upcoming only" toggle under
Favourites in the rail, and such cards show an "Upcoming YYYY" badge with
"Opening" instead of "Est.". 4 properties qualify today (3× 2027, 1× 2028).

**Star rating in the form** was hardcoded to 5/4/3 — it now offers Unrated
and 1–5, matching what the data actually contains (there are 37 2-star and
148 unrated properties that previously couldn't be set from the form).

**Detail modal contacts** are now a fixed 2×2 grid (Security Head | General
Manager / Purchase Manager | Other) instead of auto-fill, collapsing to one
column under 560px.

**Viewer edit scope narrowed to contacts only** — a viewer's edit request may
now change *only* the 16 contact fields. The whole "Basic Hotel Details"
block (id, name, brand, group, hospitality parent, category, city, state,
star rating, est. year, CPR date) is disabled in the form for viewers and
rejected with 403 by `POST /:hotel_id/edit-requests` — enforced server-side,
not just hidden. Admin/owner still edit everything via `PUT`.

**Form pickers with create-new** — Brand, Management Group, Hospitality
Parent, Category, City and State in the form modal are now type-to-filter
comboboxes over the real distinct values, with a "+ Create new: …" row when
the typed text matches nothing. Built as `window.enhanceInputCombobox` in
`combobox.js` (separate from `enhanceSelect`, which wraps a `<select>` for
the filter rail — this one wraps a text `<input>` because the value set is
open, not closed). The point is de-duplication: stopping "Marriott" /
"Marriot" / "marriott " becoming three brands. `/meta/filters` gained
`group_names` and `categories` to back these.

**Filters narrow by geography** — `GET /hotels/meta/filters` now accepts
optional `country` / `state` / `city` params and scopes the Brand,
Hospitality Group and Star Rating lists (with recomputed counts) to that
region. Selecting Goa takes Brand 203→64 and Group 112→20, and drops the
2-star option that has no Goa property. A selection the new scope
invalidates is cleared rather than left applied invisibly — the same rule
the existing State/City cascade follows.

**Card layout fix** — `.card-visual svg` was a *descendant* selector, so it
also matched the chevron inside `.card-cta` and the heart inside
`.card-fav`, stretching both to `position:absolute; inset:0; width:100%` —
that was the giant `>` overlapping "VIEW DETAILS". Now scoped to
`.card-visual > svg`. The brand/group line also went from a one-line
ellipsis to a two-line clamp so long values ("Ama Stays & Trails · IHCL
Villas") stay readable.

**Edit-approval workflow** — new
`hotel_edit_requests` table (migration `1700000007000`). Viewers get the Edit
button now; submitting computes a diff against the *live* database row
server-side (never trusts a client-supplied "before" value) and stores only
the changed fields. Admin/owner get an "Edit Requests" nav button with a
pending-count badge and a review modal showing a real from→to diff table per
field. Approve applies the stored values directly to `hotels`; reject stores
an optional note. Verified end-to-end this session with a real viewer
account, not just at the API — submit → queue → approve → confirmed in the
database.

## Known issues

**Not built**
- **Analytics nav link is still a dead `#`** — the one clearly-missing piece.
- No tests — `tests/` is empty, `npm test` will fail.
- JWT is stateless with no revocation — a leaked token stays valid up to
  the 8h `jwtExpiresIn` regardless of client-side logout.

**Data quality**
- 13 hotel names have mojibake from double-encoded UTF-8 in the source CSV,
  repaired directly in the database. The importer does not repair encoding —
  **a re-import reintroduces them.** IDs: TH00074, TH00084, TH00233, TH00293,
  TH00924, TH00931, TH00936, TH00953, TH01110, TH01269, TH01270, TH01743,
  TH01858.
- Contact data is ~79% empty (1,788 of 2,274 hotels have none of the 16
  fields) — the edit-approval workflow exists specifically to start closing
  this gap over time.

**Unverified**
- Docker path has never been run.
- No deployment target chosen.
- Mobile breakpoints verified by CSS inspection and live testing in an
  automation pane, not on a real device.

## Suggested next steps

1. Rotate `owner@thinkhealth.com` and `viewer@thinkhealth.com` off their demo
   passwords.
2. Build the Analytics page, or remove the nav link if it's not planned soon.
3. Decide whether `owner@thinkhealth.com` should be restored to owner, left
   as admin, or removed — it's a seeded account currently sitting in a
   half-renamed state.
4. Add encoding repair to the CSV importer so re-imports stay clean.
5. Decide hosting; verify the Docker path or pick a Node+Postgres PaaS.
6. Keep working through the contact-data gap via the edit-approval queue —
   it's built and working, just needs use.
