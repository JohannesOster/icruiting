# icruiting-api

Backend of [icruiting](https://icruiting.at) — Express + TypeScript, Postgres via pg-promise,
Cognito auth, S3 uploads, Puppeteer PDF reports. The Next.js frontend lives in `../web`.

## Setup

```sh
yarn                      # yarn.lock is the source of truth
cp .env.example .env.development
cp .env.example .env.test
```

Config is read by convict (`src/config.ts`) from `.env.${NODE_ENV}`, resolved against the
process cwd — run every command from this directory. `.env.example` documents each var;
the DB/Liquibase block is the only one the test suite needs.

Create the two local databases the env files point at (Postgres on `127.0.0.1:5432`):

```sh
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE icruiting_dev OWNER $USER;"
psql -h 127.0.0.1 -U postgres -c "CREATE DATABASE icruiting_test OWNER $USER;"
```

`yarn dev` starts the API on `PORT` (default 5000). Schema changes are applied with
`yarn db-migrate` (Liquibase `update`, needs a JVM). `yarn db-drop` is not its inverse —
it is Liquibase `drop-all`, which drops every object in the schema, data included.
`yarn db-sync` marks the changelog as applied without running it, for a database that
already has the schema.

## Tests

```sh
yarn test             # unit + integration
yarn test:unit        # no external dependencies
yarn test:integration # needs Postgres and a JVM
```

Jest sets `NODE_ENV=test`, so the integration run reads `.env.test`. Before the suite,
`tests/integration/jest.setup.js` runs Liquibase `update` against `LIQUIBASE_DB_URL`;
afterwards `jest.teardown.js` runs **`drop-all`** against it. Point `.env.test` at a
throwaway database and never at one you share with `yarn dev` — teardown will empty it.

`DATABASE_URL` and `LIQUIBASE_DB_URL` are separate connection strings and must name the
same database: the app connects with the former, Liquibase migrates through the latter.
Liquibase wants a JDBC URL without the `jdbc:` prefix (`migrate.ts` adds it) and takes its
credentials from `LIQUIBASE_DB_USERNAME`/`LIQUIBASE_DB_PASSWORD` rather than inline.

Cognito, S3 and Stripe are mocked in `tests/integration/jest.setupAfterEnv.js`, so those
vars can stay empty. Seed data through `tests/integration/testUtils/dataGenerator.ts`
rather than hand-writing inserts.
