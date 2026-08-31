# Thinkhealth Hotel Database Hub — Working Notes

Operational state of the project: the things that aren't derivable from the
code itself. Server-specific detail (endpoints, schema) lives in
[server/README.md](server/README.md) — this file is the layer above that,
and doubles as a context-transfer doc for handing this project to a fresh
conversation. Read this whole file before proposing work — several
decisions below were deliberate and already re-litigated once.

Last updated: 2026-08-31. Rewritten wholesale this pass — the previous
version predated the entire deployment, the About Us page, and email-
verified signup, so patching it further would have left more stale than
current.

---

## The site, live right now

| | |
| --- | --- |
| Landing page | https://thinkhealth-hub.onrender.com (redirects here if signed out) |
| Directory (signed in) | https://thinkhealth-hub.onrender.com/index.html |
| API | https://thinkhealth-api.onrender.com |
| Repo | https://github.com/thinkhealthcareandsafety/Directory.ThinkHealth (private) |
| Host | Render — `render.yaml` at repo root is the Blueprint (Postgres + API + static site) |

Real production data — 2,274 real hotels, real accounts, real people's
contact info. Deploy changes carefully; there is no staging environment.

## Layout

```
Thinkhealth/
  about.html    NEW landing page — the entry point for a signed-out visitor
  about.js      about.html's slideshow logic
  index.html    the directory (hero + search + filters + card grid)
  login.html    sign-in / sign-up / forgot-password — no directory content loads here
  404.html      branded not-found page (Render serves this for unmatched routes)
  script.js     all directory logic (filters, cards, modals, pagination, admin panels)
  auth.js       login.html's own logic (sign-in / sign-up / OTP flows)
  config.js     shared constants (API_BASE, storage keys), video loader, toast() component
  combobox.js   two widgets: enhanceSelect (filter rail) and enhanceInputCombobox (form fields with "create new")
  Style.css     one stylesheet for every page
  logo.png, hero-loop.mp4, hero-poster.jpg/webp, badge-*.png, favicon*   media/brand assets
  server/                                Node/Express + PostgreSQL API
```

No build step anywhere — open the HTML files, edit, refresh (see the cache
gotcha below, though). `API_BASE` in `config.js` is the one line that
decides local-vs-production; it must say `https://thinkhealth-api.onrender.com/api`
before any push, and `http://localhost:3000/api` while testing locally.
**Check `git diff config.js` before every commit** — several sessions have
caught this half-reverted.

**Run it locally:**
```bash
cd "C:/Users/11/Desktop/HTML CSS/Thinkhealth/server" && npm run dev
```
```bash
cd "C:/Users/11/Desktop/HTML CSS/Thinkhealth" && python -m http.server 8080
```
Open `http://localhost:8080` — signed out, it lands on `about.html`.

**Cache-busting gotcha**: every asset is referenced with a manual `?v=N`
query string (`Style.css?v=60`, `script.js?v=60`, etc.), bumped by hand on
every edit — there's no build tool doing this automatically. Forgetting to
bump it is the single most common source of "I fixed it but it's not
showing" confusion in this project, both locally (browser tab cache) and in
production (Render's CDN cache). When testing and a change doesn't appear,
bump the version number before assuming the code is wrong.

## Deployment specifics

**Case sensitivity**: built and tested on Windows (case-insensitive
filenames); Render's Linux filesystem is not. Already bit us once —
`index.html` referenced `style.css`, the tracked file is `Style.css`, 404'd
silently in production only. Check any new asset reference against
`git ls-files` exactly, not just "does it open locally."

**Env vars live in the Render dashboard**, not the repo. `server/.env`
(real Gmail SMTP password, JWT secret) is gitignored and stays local-only.
`render.yaml` deliberately leaves `CORS_ORIGINS` and all four `SMTP_*` as
`sync: false` so they can't be accidentally committed.

**`npm run migrate:up` runs automatically** as part of the API's Render
build command — a new migration file just needs to be committed and
pushed, no manual `psql` step against production. (One exception: the
initial data load — the 2,274 real hotels and accounts — was a one-time
manual `pg_dump`/`\copy` from local to production; that's done, not a
recurring step.)

## This machine

- Node.js v24.19.0 / npm 11.17.0, PostgreSQL 17 (Windows service
  `postgresql-x64-17`), psql at `C:\Program Files\PostgreSQL\17\bin\psql.exe`
- **ffmpeg**: `C:\Users\11\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build\bin\ffmpeg.exe`
  — used for the hero video (single continuous clip now, see below)
- **Docker not installed** — `Dockerfile`/`docker-compose.yml` exist, never run, not the deployment path (Render is)
- **`playwright-cli`** is available globally for browser-driven testing/QA independent of the Claude Code browser tools

| Local DB | |
| --- | --- |
| Superuser | `postgres` / `postgres` |
| App role | `thinkhealth` / `thinkhealth_dev_pw` |
| Database | `thinkhealth_hotels` |

## Accounts (production)

| Email | Role |
| --- | --- |
| `sjasmeet7499@gmail.com` | **owner** |
| `sagar.thinkhealth@gmail.com` | viewer |
| `shikha.dixit@thinkhealth.in` | admin |

All seeded/demo accounts (`owner@thinkhealth.com`, `admin@thinkhealth.com`,
`viewer@thinkhealth.com`, `demo@gmail.com`) were deleted by the real owner
through the live Manage Users panel — closes the old "rotate demo
passwords" item by removal. To recreate a seeded admin for testing, use
`npm run user:create -- <email> <password> admin` against the production
`DATABASE_URL` (get it from Render's dashboard, never hardcode it anywhere).

Local dev DB still has its own separate seeded accounts
(`admin@thinkhealth.com` / `AdminPass123`, `viewer@thinkhealth.com` /
`NewViewerPass2026!`) — these are fine to use for local testing since they
never touch production.

## Data

2,274 live hotel rows. Contact completeness tracked as **x/16** (four roles
× four fields). ~79% of hotels (1,788) have none of the 16 fields filled —
the edit-approval workflow exists to close this over time, it just needs
use, not more code.

- **Mojibake**: 13 hotel names have double-encoded UTF-8 from the source
  CSV, hand-repaired in the DB. The importer doesn't fix encoding — a
  re-import reintroduces them. IDs: TH00074, TH00084, TH00233, TH00293,
  TH00924, TH00931, TH00936, TH00953, TH01110, TH01269, TH01270, TH01743,
  TH01858.
- **`linkedin_url` schema quirk**: the "Other Contact" role's LinkedIn
  column is `linkedin_url`, not `other_contact_linkedin` like the other
  three roles. Easy to miss — grep for `linkedin_url` specifically when
  touching contact-field code.
- **Region classification** (`server/src/regions.js`): the raw `state`
  column mixes 26 Indian states, 7 union territories, and 8 foreign
  regions. Classified server-side so hero stats don't lie.
- **`category` field is nearly empty** — only one distinct value ("Business")
  exists across all 2,274 rows. The Category picker in the form will look
  broken/empty until real data populates it; that's a data gap, not a bug.
- **Products (on-site equipment)** list — AED, Stretcher, Wheelchair, First
  Aid Kit, Oxygen Cylinder, Spine Board — is explicitly a placeholder set,
  waiting on the real list from the user.

## Decisions already made — don't re-litigate

- Zoho integration was built, then deliberately removed. Postgres is the
  sole source of truth.
- **`GET /api/hotels*` requires authentication** — every directory page
  requires sign-in.
- **Self-registration requires email verification** — see "Email-verified
  signup" below. This replaced a simpler single-step register endpoint;
  don't reintroduce it.
- **Viewers propose edits, they don't make them**, and are further
  restricted to *only* the 16 contact fields (not name/brand/city/state/
  star-rating/etc.) — enforced server-side with a 403, not just hidden in
  the UI.
- **Add Hotel is admin/owner only**, verified at all three layers (UI
  hidden, API 403, nothing reaches the DB).
- **About Us (`about.html`) is now the real landing page.** A cold,
  never-signed-in visit to `index.html` redirects here, not to
  `login.html` directly. A session that *expires* mid-use still goes
  straight back to `login.html` — only a genuinely first visit sees the
  landing page. Its slide content is explicit placeholder copy pending
  real content from the user (pulled from real footer facts so it isn't
  lorem ipsum, but still marked as temporary in code comments).
- **Products checklist requires an explicit Save** — ticking a box only
  stages the change; nothing hits the server until "Save Products" is
  clicked. It auto-saved on every click earlier in the project; that was
  deliberately changed after a misclick concern.
- **No `window.alert()` anywhere in `script.js`** — replaced with a real
  toast component (`toast()` in `config.js`). `auth.js` never used `alert()`
  to begin with (inline `.auth-msg` errors). `window.confirm()` is still
  used for the three genuinely destructive actions (delete hotel, delete
  account, clear a contact) — deliberately not replaced, since a custom
  confirm dialog risks bugs on a real delete path for cosmetic gain only.

## What was built (roughly chronological)

**Security hardening, login separation, visual redesign, filter system,
sort/pagination** — the foundational work; see git history for detail if
needed, it's stable and hasn't changed recently.

**Password reset (OTP)** — self-service, no admin involvement.
`password_reset_otps` table, hashed codes only, 6-digit/5-minute/single-use,
burns itself after 5 wrong attempts. Delivered via `src/email.js`
(nodemailer over Gmail SMTP — real credentials in Render's dashboard and
local `.env`, never in the repo).

**Email-verified signup** (replaces the old one-step register) —
`POST /auth/register/request` sends an OTP and holds the hashed password in
a new `signup_otps` table; `POST /auth/register/verify` confirms the code
and *only then* inserts into `users`. An abandoned signup just expires
rather than becoming a real, never-verified account. Same hashing/
timing-safe-compare pattern as password reset, separate table, separate
rate limiter (`signupVerifyLimiter`).

**Products (on-site equipment)** — `hotels.products` jsonb column
(GIN-indexed). Canonical key list lives in *two* places that must be kept
in sync: `PRODUCT_KEYS` in `server/src/routes/hotels.js` and `PRODUCTS` in
`script.js` — the server whitelists against its own copy, so an unlisted
key is silently dropped, not stored. Explicit Save button (see Decisions).

**Upcoming properties** — `establishment_year` in the future = not open
yet. Filtered server-side on the DB's own clock. "Upcoming only" toggle in
the rail; such cards show an "Upcoming YYYY" badge and "Opening" instead
of "Est."

**Form pickers with create-new** — Brand, Group, Hospitality Parent,
Category, City, State in the Add/Edit form are type-to-filter comboboxes
(`window.enhanceInputCombobox` in `combobox.js`, distinct from
`enhanceSelect` which wraps the filter rail's `<select>`s) with a
"+ Create new: …" row when nothing matches. Point is de-duplication —
stops "Marriott"/"Marriot"/"marriott " becoming three brands.

**Filters narrow by geography** — `/hotels/meta/filters` accepts optional
`country`/`state`/`city` and scopes Brand/Group/Star-Rating (with
recomputed counts) to that region. A selection the new scope invalidates
clears itself rather than silently returning zero results.

**Viewer edit scope narrowed to contacts-only** — see Decisions above.

**Edit-approval workflow** — `hotel_edit_requests` table. Viewer submits →
server computes the diff against the *live* row (never trusts a
client-supplied "before") → admin/owner reviews a real from→to diff →
approve applies it, reject stores an optional note. Verified end-to-end
with a real account, not just at the API.

**Deployment** — pushed to GitHub, deployed on Render via `render.yaml`
(Postgres + API web service + static site, one Blueprint). Hit and fixed
two real deploy-only bugs: `node-pg-migrate` was a devDependency and got
skipped by `npm install` under `NODE_ENV=production` (moved to real
dependencies), and the `style.css`/`Style.css` case-sensitivity 404
mentioned above. Production data was migrated once from local via
`pg_dump`/`\copy`, excluding two test hotel rows (`TH02275`, `TH99500`)
that had leaked into local data.

**Mobile audit** — two real bugs, not just polish. (1) The mobile app-bar
switches to a two-row layout but the container kept its one-row height —
the second row (Directory/Analytics nav) rendered *outside* the header's
own background, landing directly on the hero photo as invisible dark-on-
dark text. Fixed with `height: auto`. (2) The hero/login video was
excluded outright below 640px width on the assumption that a small screen
implies a slow connection — it doesn't, and the practical effect was the
video never played on any phone, full stop. Replaced the width check with
the real signals (data-saver, actual 2G, reduced-motion) already used for
everyone else. Also fixed: "Edit Requests" rendering on top of the logo at
narrow widths for an admin session (now hidden on mobile like the other
two admin buttons); added a scroll-fade mask to the horizontally-scrolling
sort-pill row so it doesn't look like it just cuts off mid-word.

**Directory UX pass** — hotel cards now show labelled fact rows ("City:
Kolkata", "State: West Bengal", ...) instead of an ambiguous run-together
string. The sort control (7 fields × 2 directions) collapsed behind a
"Sort: Name · Ascending" toggle instead of sitting permanently on screen —
it was also mislabeled "Alphabetical filters" for something that sorts,
not filters. A "Clear filters" reset now also lives in the toolbar, not
only in the rail (which is unreachable once its drawer closes on mobile or
scrolls past on desktop). Hero numbers count up from their previous value
on load and on every filter change instead of snapping to the new figure.

**Login page polish** — show/hide toggle on every password field. Video
scrim darkened (was too washed out for the sign-in card to read against a
bright frame).

**About Us landing page** (`about.html`/`about.js`) — auto-advancing,
cross-fading slide panels with a filling progress bar per tab (NVIDIA
newsroom pattern), pausable on hover/focus, tabs/dots jump directly. Hit
and fixed two real bugs building this: the fade-in never played because
`requestAnimationFrame` gets throttled/suspended in a backgrounded tab
(switched to a forced-reflow technique instead of double-rAF), and the
progress bar had zero rendered width because it was a `<span>` (default
`display: inline`) styled with block-level `width`/`height` (added
`display: block`). See Decisions above for the landing-page redirect logic.

**Site footer, favicon, accreditation badges, social links** — full footer
with real contact info, social icons, and four accreditation badges
(ISO 9001, American Heart Association, MSME, Make in India) — the source
files arrived as AVIF-with-alpha disguised as `.jpg`/mismatched extensions
more than once; always verify actual file format before trusting an
extension. Favicon generated in the standard sizes (`.ico`, 16/32px PNG,
180px apple-touch-icon) from a single source PNG.

**Taste-skill design audit** — ran the redesign-skill checklist against
the whole site honestly rather than mechanically. Most of it didn't apply:
the color palette (single brass accent, warm-tinted neutrals throughout),
the Fraunces/Inter/IBM Plex Mono type pairing, tinted shadows, and
hover/press states were already deliberate, not generic-AI defaults —
left alone on purpose. Real gaps fixed: all 12 `window.alert()` calls in
`script.js` replaced with a real toast component; `text-wrap: balance` on
the real single-block headlines; meta description on every page plus Open
Graph tags on `about.html` specifically (the one page meant to be shared);
a branded `404.html` (confirmed Render serves it, with a real `404` status,
for any unmatched route); skip-to-content links on all three pages.
Deliberately *not* changed: the modal-based record editor (legitimate
pattern for CRUD, not "modals for everything" laziness), and
`window.confirm()` on the three destructive actions.

## Known issues

**Not built**
- Analytics nav link is still a dead `#`.
- No automated tests — `tests/` is empty, `npm test` fails.
- JWT is stateless with no revocation — a leaked token stays valid up to
  the 8h `jwtExpiresIn` regardless of client-side logout.

**Unverified**
- The skip-to-content links' CSS is standard and correct by inspection,
  but couldn't be confirmed via the browser automation tooling this
  session (it hit a tooling-level limitation — even a forced inline style
  wasn't reflected in a readback, which is browser-impossible, i.e. the
  test harness, not the code). Worth a real Tab-key check.
- Mobile verified extensively via an automation pane and DOM measurement,
  not on a real physical device.
- Docker path has never been run — not the deployment path anyway (Render
  is), so low priority to ever verify.

**Data quality** — see the Data section above (mojibake, `category` field,
placeholder products list).

## In progress — pick this up next

**A new page using a `design-md/` design system, via the taste-skill
plugin.** Started, then explicitly paused by the user before either open
question was answered — do not guess and build, ask again:

1. **Which design system?** `design-md/` (repo root, gitignored — see
   below) has 70+ reference folders, each a `DESIGN.md` + `README.md` pair
   generated by the Stitch semantic-design-system skill, named after real
   products/brands (`nvidia`, `stripe`, `linear.app`, `apple`, `notion`,
   `spotify`, ...). Run `ls design-md/` for the current full list — none
   was picked yet.
2. **What is the page actually for?** Not specified. Two live candidates
   floated in the conversation that led here: (a) finally replacing
   `about.html`'s placeholder slide content with something real, or (b) an
   entirely separate new page. Neither was chosen.

`design-md/` is leftover reference material that came bundled with a
design-audit skill run earlier, not part of this site. It's now in
`.gitignore` (added after it was found sitting untracked and un-ignored —
a plain `git add -A` would have swept all 70 brands' worth of docs into
this repo otherwise).

## Suggested next steps

1. Get the real product/equipment list from the user to replace the
   AED/Stretcher/Wheelchair placeholder set (two files to update — see
   "Products" above).
2. Get real slide copy + imagery for `about.html` to replace the
   placeholder content (marked clearly in `about.js`).
3. Build the Analytics page, or remove the dead nav link if it's not
   planned soon.
4. Add JWT revocation (a `token_version` column + check, or a denylist) if
   session-hijacking risk matters more than the added DB read per request.
5. Add encoding repair to the CSV importer so a re-import doesn't
   reintroduce the 13 known mojibake names.
6. Real Tab-key check on the skip-to-content links (see Unverified above).
7. Keep working the contact-data gap via the edit-approval queue — built
   and working, just needs use (79% of hotels still have zero contact
   fields filled).
