# icruiting

Recruiting/assessment tool for student consultancies, live at https://icruiting.at. German-language UI.
One repo, two packages (merged from two repos on 2026-09-09, JO-9; full history preserved):

- `server/` — Express + TypeScript API, Postgres via pg-promise (SQL lives in `.sql` files next to the repository code), Cognito auth, S3 uploads, Puppeteer PDF reports. Uses **yarn**. Deployed on Heroku.
- `web/` — Next.js 13 pages router, React 18, styled-components, Amplify/Cognito, SWR. Uses **npm**. Deployed on Netlify (base directory `web`, root `netlify.toml`).

Background reading: `AUDIT.md` (architecture, findings, roadmap). Read the section relevant to your ticket, not the whole file.

## Work is tracked in Linear

`.linear.md` has the team/project. **The ticket is the spec** — start by reading it (`linear` skill) including comments. Tickets reference `file:line`; those were accurate on 2026-09-04 and predate the monorepo — prefix them with `server/` or `web/`, and re-verify before editing.

Handoff protocol for an implementation session:
1. Move the ticket to `In Progress`.
2. Branch from `main`: `jo-<number>-<short-slug>`. Prefer a worktree: `scripts/worktree.sh jo-<number>-<short-slug>` creates `.worktrees/<branch>/` with `.env.*` and `node_modules` linked in, so it runs immediately. Open that folder as the workspace.
3. Do only what the ticket says. Anything else you notice → create a new Linear issue in the `icruiting` project (prefix `server:`/`web:`/`infra:`), don't fix it in passing.
4. Commit, push the branch, open a PR with `gh`, and comment the PR URL + what you verified on the ticket. Leave the ticket `In Progress` — the owner merges and moves it to `Done`.

## Hard rules

- **Pushing to `main` deploys to production** — Netlify builds `main` on push (web), and `.github/workflows/deploy-server.yml` pushes a `git subtree split` of `server/` to Heroku on every `main` push that touches it. Never push to `main`. PRs only.
- Production data stays untouched: no `DATABASE_URL` pointing at RDS, no Cognito prod pool, no Stripe live key. Local Postgres only. Heroku is the exception — see "Heroku access" below.
- Prefer "observe, then change" for anything that alters live behaviour (routes, emails, auth). If a ticket says to verify usage first, do that and report — don't skip to the removal.
- Secrets: `.env*` files are git-ignored and must stay that way. Never commit webhooks, keys, or pool IDs beyond the ones already in `web/src/config.ts` (which are being moved to env, JO-23).

## Heroku access

The API runs as the Heroku app **`icruiting-api`** (the account's only app). The CLI is installed at `~/.local/bin/heroku`; a full-access token lives in `~/.config/heroku/token` (mode 600) and `~/.bashrc` exports it as `HEROKU_API_KEY`, so every shell is already authed — no login step.

Granted 2026-09-07 for the JO-3 deploy: read freely (logs, releases, config, `ps`), and set/unset config vars. **The owner still merges every PR** — merging is what deploys, so it stays a human action.

Deploys reach Heroku only through `.github/workflows/deploy-server.yml` (git push of the `server/` split to `git.heroku.com/icruiting-api.git`, authenticated with the repo secret `HEROKU_API_KEY`). The old GitHub-integration path from the archived `icruiting-server` repo is dead. Re-run a deploy of the current `main` with `gh workflow run "Deploy server to Heroku"`. Heroku's git remote is only ever written by that workflow; do not push to it by hand.

Gotchas, in the order they bite:

- `heroku login` on this VPS always fails with an IP mismatch — the browser completing the auth is on a different network. The token above is the way in; mint replacements on a machine with a browser (`heroku authorizations:create`).
- `heroku config` prints every secret. List names only (`heroku config --json | jq keys`) so values stay out of transcripts.
- Every `config:set`/`config:unset` restarts the dyno. Batch changes into one command to spend one restart.
- `NODE_ENV` is **not** a config var — `yarn start` runs pm2 with `--env production`, and `src/ecosystem.config.ts` injects it there. `heroku config:get NODE_ENV` returns empty on a healthy app. To check it behaviourally: `middlewares.ts` leaks `err.stack` in responses whenever `NODE_ENV !== 'production'`, so a 404 body carrying no `stack` proves it.
- `heroku run -- node -e '…'` executes on a dyno with the real env, which diagnoses credential and config questions without pulling secrets onto this box.
- Config vars removed during JO-3/42/43 are backed up at `~/.config/heroku/removed-config-vars.*.json`, should a restore be needed.

## Netlify access

The web app is the Netlify site **`icruiting`** (`5e9234ed-469e-43ee-bf93-c0e9e49fcf34`), built from this repo's `main` with base directory `web` (root `netlify.toml`). The CLI is at `~/.local/bin/netlify`; a personal access token lives in `~/.config/netlify/token` (mode 600) — export it as `NETLIFY_AUTH_TOKEN` for each call, e.g. `NETLIFY_AUTH_TOKEN=$(cat ~/.config/netlify/token) netlify api listSiteDeploys --data '{"site_id":"5e92…"}'`. `netlify api <method>` gives the whole REST API; `getSite`, `listSiteDeploys`, `getDeploy` cover most questions. Merging to `main` is the deploy; PRs get deploy previews automatically. Site settings changes (`updateSite`) are owner-approved actions.

## Error alerting

Server 5xx and new-tenant signups push to ntfy (JO-3). The topic is in `~/.config/heroku/ntfy-topic` and set as `NTFY_TOPIC` on Heroku; `NTFY_URL` is unset, so it falls back to `https://ntfy.sh`. Alerts fire only when `NODE_ENV=production`, so they are unreachable locally — force it the way `logger.test.ts` does rather than pointing a dev run at the live topic.

`errorHandler` notifies on `statusCode >= 500` only; 4xx stays silent on purpose, because alerting on 401 meant every bot scan paged the owner. ntfy.sh topics are public and unauthenticated — anyone knowing the name reads the stack traces, which is why the name is random and unpublished.

To confirm alerting end to end: `GET /forms/not-a-uuid/html` returns a genuine 500 with no side effects, and `curl -s "https://ntfy.sh/<topic>/json?poll=1&since=<unix-ts>"` reads the topic back without a phone.

## Running things locally

The VPS has Node 24, yarn 1, Postgres 18 on `127.0.0.1:5432`, Java 25 (for Liquibase), `gh` authed, `heroku` and `netlify` authed (see above). No Docker, no aws CLI.

Server:
- `cd server && yarn` (yarn.lock is the source of truth).
- Config comes from `.env.<NODE_ENV>` via convict (`src/config.ts`). There is no `.env.example` yet — create `.env.development` / `.env.test` locally from the var list in `src/config.ts`; every var defaults to `''` so missing ones fail late, not at startup.
- `yarn test:unit` needs nothing external. `yarn test:integration` needs a Postgres reachable via `DATABASE_URL` and `LIQUIBASE_*` (it runs Liquibase `update` in `tests/integration/jest.setup.js` and `drop-all` in teardown — point it at a throwaway database, never a shared one).
- `yarn dev` → port 5000 (`PORT`). Bind `0.0.0.0` and report `http://agent-vps:5000`.
- Typecheck: `npx tsc --noEmit -p tsconfig.json`. Lint is tslint (empty rules) — treat `prettier --check` as the real formatter gate.

Web:
- `cd web && npm install` (package-lock; Netlify uses `NPM_CONFIG_LEGACY_PEER_DEPS=true`, you'll need `--legacy-peer-deps` too).
- `npm run dev` → Next dev server; run with `-H 0.0.0.0` and report `http://agent-vps:3000`. `NEXT_PUBLIC_APP_ENV` unset → `development` config (`src/config.ts`), which targets the dev Cognito pool and `http://localhost:5000`.
- `npx tsc --noEmit`, `npm test` (two unit tests), `npm run build` is the real gate.

## Conventions

- Prettier: single quotes, trailing commas, no bracket spacing, 100 cols (`.prettierrc` in both packages). Run it on files you touch.
- Server modules follow `domain/ → mappers/ → application/*Adapter.ts → infrastructure/{http,repositories}`; new code goes in the same shape. Handlers return `{status, body}` through `httpReqHandler`.
- Web components: `X.tsx` + `X.sc.ts` + `types.ts` + `index.ts`, exported via `src/components/index.ts`. Pages wrap with `withAuth`/`withAdmin`.
- UI copy is German; keep it that way and don't introduce i18n scaffolding unless a ticket asks.
- Tests: server integration tests seed through `tests/integration/testUtils/dataGenerator.ts` — reuse it rather than hand-writing inserts.
