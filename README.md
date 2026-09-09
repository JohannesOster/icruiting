# icruiting

Recruiting/assessment tool for student consultancies — https://icruiting.at

- `server/` — Express + TypeScript API (Postgres, Cognito, S3, Puppeteer). Deployed to Heroku by `.github/workflows/deploy-server.yml` on push to `main`.
- `web/` — Next.js frontend. Deployed by Netlify from `main` (base directory `web`, see `netlify.toml`).

See `CLAUDE.md` for how to work in this repo and `AUDIT.md` for the state of the codebase and the roadmap.
Issues live in Linear, project **icruiting** (team JO).

Merged from the former `icruiting-server` and `icruiting-web` repositories on 2026-09-09 with full history: `git blame` and `git log -m --follow <path>` work across the move (plain `--follow` needs `-m` to cross the subtree merge).
