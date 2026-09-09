# icruiting — Audit & Roadmap (2026-09-04)

Audit of `icruiting-server` (Express/Postgres API) and `icruiting-web` (Next.js) plus the live infrastructure.
Linear: team `JO`, project **icruiting** — https://linear.app/tobos/project/icruiting-3c950573e753

## 1. Live infrastructure (verified from outside)

| Piece | Where | Evidence |
|---|---|---|
| `icruiting.at` / `www` | Netlify, Next.js runtime (`@netlify/plugin-nextjs` v5) | `server: Netlify`, CNAME `objective-northcutt-d95066.netlify.app` |
| API | Heroku, `icruiting-api.herokuapp.com` (no `api.icruiting.at` record) | `Server: Heroku`, `/jobs` → 401 |
| DB | AWS RDS Postgres, eu-central-1 | `DATABASE_URL`, SSL commit Apr 2026 |
| Auth | AWS Cognito, 2 user pools (dev `eu-central-1_MeIKYtqcU`, prod `eu-central-1_WK7ijcvLY`) + Hosted UI + Google OAuth | `web/src/config.ts` |
| Files | S3 bucket, presigned GETs (1h) | `storageService.ts` |
| Mail | Zoho EU (MX + SMTP `smtp.zoho.eu:465` hardcoded) | DNS MX, `mailService.ts:12` |
| DNS | GoDaddy (`ns19/20.domaincontrol.com`) | NS records |
| Docs | `docs.icruiting.at` → GitHub Pages | CNAME `johannesoster.github.io` |
| Error alerts | Discord webhook | `logger.ts:33` |
| Billing | Stripe (no paying customers as of today) | |

Estimated monthly cost: Heroku dyno + RDS ≈ $25–35; everything else ≈ free. Only the API+DB are worth moving.

Repo activity: server last commit Apr 2026, web Sep 2025. 932 / 558 commits. `develop` == `main` in both.

## 2. Architecture

### Domain
`tenant` (org, Stripe customer, optional CSS theme) → `job` → `job_requirement` (weighted competency) → `form` (category ∈ application | screening | assessment | onboarding; `replica_of` self-FK) → `form_field` (component, `intent` ∈ sum_up | count_distinct | aggregate, optional `job_requirement_id`).
Public HTML application form creates `applicant` + `applicant_attribute`. Members submit `form_submission` (unique on applicant+submitter+form) with `form_submission_field`. `report_field` whitelists report columns. Rankings/reports aggregate `sum_up` fields per applicant against requirements; PDF via Puppeteer + pug.

Schema: `server/src/infrastructure/db/migrations/sql/00_create_schema.sql` — 10 tables, 3 views (`ranking` looks dead), 2 Liquibase changesets total. **No secondary indexes at all.**

### Server (~5.0k LOC src, ~4.9k LOC tests)
`index.ts` → `http/app.ts` (json, permissive `cors()`, pug) → `routes.ts` mounts 8 module routers. Each module: `domain/` (factories), `mappers/`, `application/*Adapter.ts` (handlers via `httpReqHandler`), `infrastructure/http/` (router + express-validator), `infrastructure/repositories/` (pg-promise, `.sql` QueryFiles). Consistent, readable. `forms` module deviates in folder layout; `members`/`subscriptions`/`rankings` are thin.

Config: convict + dotenv (`.env.<NODE_ENV>`), every var defaults to `''` so validation never fails. Vars: `DATABASE_URL`, `LIQUIBASE_*` (separate creds), `S3_BUCKET/REGION`, `AWS_USER_POOL_ID/CLIENT_ID/REGION`, `EMAIL_ADRESS`(sic)`/PASSWORD`, `STRIPE_SECRET_KEY`, `FREE_STRIPE_PRODUCT_ID`, `DISCORD_ERROR_LOGGING_WEBHOOK`, `API_BASE_URL`, `PORT`.

Deploy: no Procfile, no Dockerfile, no `engines`. Heroku runs `yarn start` → `pm2-runtime` with `watch: ['dist']` (wrong in prod). `heroku-postbuild` moves the Puppeteer cache with a non-idempotent `mkdir`. Path aliases resolved at runtime via `NODE_PATH=dist/`. tsconfig targets `es5`. No CI.

Tests: unit (report pipeline, domain factories — good) + integration against a real Postgres via Liquibase, with `authService`/`stripe`/`storageService` mocked. `validateToken` resolves `{}` so **no auth/authz or cross-tenant tests exist**.

### Web (~12.4k LOC)
Next 13 pages router, **fully client-rendered** (zero `getServerSideProps`), auth via `withAuth`/`withAdmin` HOCs → protected pages flash-then-redirect. German-only, hardcoded copy. Structure: `pages/` 5.2k, `components/` 5.1k (UI kit + FormBuilder ~1.1k), `services/` 0.8k (thin wrappers over Amplify `API`), `context/` (Auth, Toaster, Segment analytics), two-layer theme system (primitives → concepts → semantic tokens).

Config: only 3 env vars (`NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SEGMENT_WRITEKEY`); everything else hardcoded in `src/config.ts`.

Deploy: `netlify.toml` = plugin + `NPM_CONFIG_LEGACY_PEER_DEPS=true` (load-bearing: React 18 vs react-dnd 10 / react-chartjs-2 v2 / RTL 9). `--openssl-legacy-provider` only in `dev`/`start`, not `build`. No Node pin.

Tests: 2 pure-function unit tests. Jest can't resolve the `src/` alias, so no component test could run today.

### Feature inventory (what a user can do)
Tenant signup with Stripe plan pick · login (password / Hosted UI / Google, account linking) · forced new-password · password reset · jobs CRUD + weighted requirement profile + JSON export · drag-and-drop FormBuilder (13 field types incl. file upload, rating groups, AC rating), 4 form categories, command palette, replication across jobs · public application form (pug, server-rendered) with confirmation email · applicants: paginated/filterable table, detail, edit, confirm, delete, CSV export · screening/assessment submissions · rankings per category + overview · report builder · radar-chart report (admin) + personal report · PDF export · members: invite (bulk), roles, remove · tenant theme upload · Stripe payment methods + subscriptions · delete tenant.

## 3. Findings

### 3.1 Security (verified by hand)
| # | Where | Issue |
|---|---|---|
| S1 | `server/src/infrastructure/http/routes.ts:27-338` | **Unauthenticated `/pdf` route**, 310 lines of hardcoded demo data; launches Puppeteer and writes a PDF to CWD on every request. Live on Heroku (hangs >15 s). Free DoS / disk fill. Provenance: prototype from commit `418965f` (2024-10-03); the real feature is the authenticated `GET /applicants/:id/report/pdf` that the web app calls. `/pdf` reads no DB data and responds with the string `"PDF generated"`, so no caller can get anything from it — but verify via Heroku router logs before removing. |
| S2 | `server/src/modules/tenants/application/subscriptionsAdapter.ts:25-30` | `DELETE /subscriptions/:id` cancels any Stripe subscription without ownership check (cross-tenant IDOR). |
| S3 | `server/src/modules/formSubmissions/infrastructure/repositories/formSubmissions/formSubmissions.ts:66-67` | `update` scopes by `tenant_id` only, not `submitter_id` — any member can overwrite a colleague's evaluation. |
| S4 | `web/src/config.ts:13,29` | Live Discord webhook URL committed to a public repo and shipped in the client bundle. Rotate. |
| S5 | `server/.../forms/.../sql/retrieve.sql:6` + `applicants/application/applicantsAdapter.ts:118` | `forms.retrieve(null, formId)` bypasses tenant filter; reachable with an arbitrary `formId` from an authenticated route. |
| S6 | `server/src/infrastructure/http/app.ts` | `cors()` with no origin allowlist. |
| S7 | `server/src/infrastructure/db/db.ts:15` | `ssl: {rejectUnauthorized: false}` in prod; `amazon-rds-ca-cert.pem` committed but unused. |
| S8 | `server/.../forms/application/applicantsAdapter.ts:37` | `formidable.maxFileSize` commented out → no upload size limit. |
| S9 | `server/src/infrastructure/http/middlewares.ts:15` | `err.stack` returned whenever `NODE_ENV !== 'production'`. |
| S10 | `web/src/pages/dashboard/jobs/[jobId]/reportbuilder.tsx:113` | Only dashboard page exported without `withAuth`/`withAdmin`. |

### 3.2 Bugs
| # | Where | Issue |
|---|---|---|
| B1 | `server/.../jobsRepository.ts:83`, `formsRepository.ts:118` | `promises.concat(...)` result discarded → deletes fire outside `t.batch`, failures escape the transaction. |
| B2 | `server/src/shared/infrastructure/http/httpReqHandler.ts:47` | `mapDomainErrors` keyed on `typeof error` (always `'object'`) → `ValidationError` never maps to 422. |
| B3 | `server/src/shared/infrastructure/services/authService/authService.ts:30` | Missing `return` after `reject(err)`; continues into `payload[...]` on undefined. |
| B4 | `server/src/ecosystem.config.ts` | pm2 `watch: ['dist']` in production. |
| B5 | `server/package.json` `heroku-postbuild` | `mkdir ./.cache` without `-p`; hardcoded `/app`. |
| B6 | both `package.json` | No `engines` / `.nvmrc`; server tsconfig `target: es5`, `lib: ["es6"]`. |
| B7 | `server/.../subscriptions/application/subscriptionsAdapter.ts:7` | `list` returns 201 for a GET. |
| B8 | `server/.../forms/application/applicantsAdapter.ts:14` | Hardcoded job UUID selects an alternate email template. |
| B9 | `server/.../applicants/application/BrowserManager` | Puppeteer browser per adapter, 5 s idle timeout, crashed browser never recovered. |
| B10 | `web/src/pages/dashboard/jobs/[jobId]/ranking.tsx:77-83` | Submit handler only `console.log`s — half-finished. |
| B11 | `web/src/pages/login/callback.tsx:70` | OAuth errors swallowed into `console.log`. |
| B12 | `web/src/services/applicants/service.ts:19` | Default sort key is the German display label `'Vollständiger Name'`; same labels used as business keys server-side (`applicantsRepository.ts:30` etc.). |
| B13 | `server/src/infrastructure/db/migrations/sql/00_create_schema.sql` | No indexes on any `tenant_id`/`job_id`/`form_id` FK. |

### 3.3 Dead weight / duplication
**Server**: `/pdf` fixture (310 lines of `routes.ts`) · `faker`, `make-runnable` (hijacks `process.argv` when imported, incl. in test setup), `copyfiles`, `pm2` in prod deps · `@types/aws-sdk`, `babel-plugin-styled-components` in a backend · tslint with empty rules · two `ApplicantsAdapter`s and two applicant repositories (`modules/applicants/...` vs `modules/forms/infrastructure/db/repositories/applicants/`) · duplicated `application-confirmation-email.pug` · `validateSubscription` duplicating `requireSubscription` middleware · dead `ranking` view · commented-out `/mail` route and status filter · `typings/cognito-express` is an empty `declare module`.

**Web**: `react-scripts` (unused; largest install/CVE source) · `react-styleguidist` with no config · `faker`, `react-hotkeys`, `@testing-library/*` imported nowhere · `ds.tsx` scratch page · landing-page contact form UI commented out but its yup schema + Discord `fetch` still live · `report.tsx` + `personal-report.tsx` ~80 % duplicated (846 lines) · tslint + `@typescript-eslint@3` + eslint configs with no `.eslintrc` and no lint script · `strict: false`, `target: es5` · zero `aria-*`/`role=` in the whole UI.

### 3.4 Upgrade debt (web, by pain)
1. `aws-amplify` v3 → v6 is a rewrite of `Auth`/`API`; `services/request.ts` *is* Amplify. Lighter path: drop Amplify, use `amazon-cognito-identity-js` + `fetch` directly.
2. `swr` 0.3 → 2: removed `revalidate()` used in 6 places, `ConfigInterface` renamed.
3. `react-hook-form` 6 → 7: `errors` moved into `formState`; custom `react-hook-form-errors-for.ts` shim everywhere.
4. `react-dnd` 10 → 16, `chart.js` 2 → 4 + `react-chartjs-2` 2 → 5, `yup` 0.28 → 1, `@types/react-dom` 16 vs `@types/react` 18.

Server deps are mostly current (Express 4, pg-promise 11, puppeteer 23, stripe 16, TS 5.5).

## 4. Roadmap

Decisions taken (2026-09-04): keep Cognito for now · no Docker — systemd + apt Postgres + Caddy on one small VPS (Hetzner; `hcloud` already configured) · merge into a monorepo · no paying customers → **remove Stripe billing entirely** (S2 becomes moot) · Discord webhooks → **ntfy** (same pattern as `~/ops/stock-watch.sh`) · be conservative with anything that changes live behaviour: observe before removing · no code changes until the roadmap is agreed.

### Phase 0 — Stop the bleeding (deployable to current Heroku/Netlify, days)
- `/pdf` demo route (S1): watch Heroku router logs for hits for ~a week, then remove if zero.
- Rotate the leaked Discord webhook; remove it from the web bundle; server error alerts Discord → ntfy (S4).
- Submitter check on submission update (S3).
- Pin Node (`engines` + `.nvmrc`) in both repos; fix `heroku-postbuild` and pm2 watch (B4–B6).

### Phase 0b — Decouple embedded forms from `icruiting-api.herokuapp.com` (JO-44; long lead time, start now)
Discovered 2026-09-07: the iframe snippet customers paste into their sites is generated in `web/src/pages/dashboard/formbuilder.tsx:220-221` from `config.endpoint.url`, so the Heroku hostname is baked into customer pages, and the snippet's resize listener checks `event.origin` against it. A later 301 would keep forms loading but break auto-height. Heroku has no custom domain, no log drain, and a 1500-line log buffer, so nothing can be observed after the fact.
- JO-45 add `api.icruiting.at` to the Heroku app (ACM, free on Basic) — additive, zero impact. GoDaddy CNAME is an owner action.
- JO-46 make the served form host-agnostic (`formsAdapter.ts:90` posts to `API_BASE_URL` today → relative).
- JO-47 log drain + one structured log line (host, path, formId, referer) on the public form routes — this is also the observation step for `/pdf` (JO-2).
- JO-48 switch the web app + generated snippet to the new host.
- JO-49 migrate the customers still on the old host; decide hard cut vs. paid redirect grace period. **Hard precondition for JO-35.**
Phase 4 then reduces to flipping one CNAME.

### Phase 1 — Monorepo + working dev loop (week)
- `git subtree` both repos into `icruiting/{server,web}` preserving history; one `README`, one `CLAUDE.md`, `.env.example`s.
- Get integration tests running against the local Postgres on this VPS; make `yarn test` green in both packages.
- Replace tslint with ESLint + Prettier in both; add a GitHub Actions workflow (lint, typecheck, test, build).
- Replace Liquibase (JVM) with a plain SQL migration runner (e.g. `node-pg-migrate` or a 40-line script); fold the two changesets into a baseline.

### Phase 2 — Shrink (week)
- Server: remove unused prod deps, merge the two applicant adapters/repos, dedupe email template, dedupe subscription checks, fix B1/B2/B3/B7, add FK indexes (B13), rename `EMAIL_ADRESS`, make convict actually validate.
- Web: remove `react-scripts`, styleguidist, faker, hotkeys, RTL; delete `ds.tsx` and the dead contact form; consolidate `report.tsx`/`personal-report.tsx`; add `withAuth` to reportbuilder (S10); move hardcoded config into env.
- Remove billing: subscriptions + payment modules, paymentService, Stripe middleware + `validateSubscription`, signup price picker, 2 settings pages, `@stripe/*` + `stripe` deps, stripe test mocks. Decide alongside whether tenant self-signup stays open (`SIGNUP_ENABLED` flag).

### Phase 3 — Dependency modernization (1–2 weeks)
- Web: drop Amplify for `amazon-cognito-identity-js` + `fetch`; SWR 2; RHF 7; react-dnd 16; chart.js 4; yup 1; drop `legacy-peer-deps`; `strict: true`; Next 15 (or evaluate a Vite SPA since nothing is server-rendered).
- Server: tsconfig `target: es2022`, drop `NODE_PATH` hack (use `tsc` path rewriting or relative imports), harden CORS (S6), upload limit (S8), proper RDS/Postgres TLS (S7).

### Phase 4 — Hosting migration (days, after 1–3)
- Provision one small VPS (Hetzner CX22-class, ~€4/mo): Node 22 LTS, apt Postgres 16, Caddy for TLS/reverse proxy, Chromium deps for Puppeteer, systemd units for API and `next start` (or static files if the web app becomes a SPA), nightly `pg_dump` to S3/B2.
- `pg_dump` RDS → restore; flip the `api.icruiting.at` CNAME from Heroku to the box (only after Phase 0b reports zero herokuapp.com traffic); move web off Netlify only if it simplifies things (Netlify is free — optional).
- Decommission Heroku dyno + RDS. Keep Cognito, S3, Zoho, GoDaddy.

### Phase 5 — Bugs & features (ongoing)
- Known-bug list from the owner (to be added).
- Obvious feature gaps surfaced by the audit: auth/authz + cross-tenant integration tests; a11y on custom Dialog/DropDown/Select; wire up or remove the ranking submit handler (B10).
