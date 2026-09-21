# Authentication: invite-only, passwordless

Since JO-75 there is no self-service signup and no password anywhere in the product. Every account
is created by an admin's invite; people log in with a one-time code sent to their e-mail, or with
Google if the invited address is a Google account.

## The pieces

| Piece | Where | Role |
|---|---|---|
| Cognito user pools | dev `eu-central-1_MeIKYtqcU`, prod `eu-central-1_WK7ijcvLY` | Users, tokens. Essentials plan, `EMAIL_OTP` allowed as first factor, app client with `USER_AUTH` only, `PreventUserExistenceErrors=LEGACY`. |
| `linkProviders` Lambda | `infra/lambda/linkProviders/` (one function, both pools) | PreSignUp trigger. Google login → link to the invited user with that e-mail, or throw "Du wurdest noch nicht eingeladen…" so Cognito creates nothing. |
| Invite | `server/…/authService.createUser`, `membersAdapter.create` | `adminCreateUser` with `email_verified=true`, no Cognito mail, random permanent password → user is CONFIRMED. Our own invitation mail (`member-invitation-email.pug`) via SMTP. |
| Login page | `web/src/pages/login/index.tsx`, `services/auth/service.ts` | `InitiateAuth(USER_AUTH, PREFERRED_CHALLENGE=EMAIL_OTP)` → `RespondToAuthChallenge(EMAIL_OTP)` with `@aws-sdk/client-cognito-identity-provider`; tokens go into Amplify's session store (`storeSession`), same as the Google callback. |
| Google callback | `web/src/pages/login/callback.tsx` | Code → tokens. Shows the Lambda's message as a toast; repeats the login once on Cognito's "Already found an entry" after a fresh link. |
| Guards | `requireAuth` (403 without `custom:tenant_id`), `withAuth` (→ `/not-invited`) | A token that belongs to no organisation gets nowhere. |

## Why the details are the way they are

- **Cognito refuses a federated login into a user whose e-mail is not verified** (`invalid_grant` at the
  token exchange) and into one in `FORCE_CHANGE_PASSWORD`. Hence invites set `email_verified=true`
  and a permanent password, and the Lambda repairs both before linking (legacy users).
- **`PreventUserExistenceErrors=LEGACY`**: with `ENABLED`, Cognito fakes an e-mail-code challenge for
  unknown addresses and no mail ever arrives. Invite-only means telling people "you are not invited"
  is the feature, so the client reports `UserNotFoundException` and the login page translates it.
- **`PASSWORD` stays in the pool's allowed first factors** — Cognito does not allow removing it. The
  app client only allows `USER_AUTH`, nothing in the UI asks for a password, and no user ever learns
  one. Dropping the password rule everywhere else keeps it that way.
- **Why a Lambda at all**: Cognito cannot link a social identity to an existing user by itself. Before
  JO-75 the Lambda only linked and let everything else through, which created ~90 orphan Google users
  over the years (JO-63).
- **Cognito's own e-mail sender is capped at 50 mails/day per pool.** Enough for dev, not for a
  cohort onboarding + login codes in prod → prod must send via SES (see rollout).

## Local development

The dev pool is already configured. `server/.env.development` needs the pool IDs (public, same as
`web/src/config.ts`), `S3_REGION`, and an IAM key scoped to the dev pool/bucket (`icruiting-dev`) for
member listing and invites. To reach the dev servers from another tailnet device over HTTPS:

```
tailscale serve --bg --https=443   http://127.0.0.1:3000
tailscale serve --bg --https=10000 http://127.0.0.1:5000
cd web && NEXT_PUBLIC_API_URL=https://agent-vps.tailf4690b.ts.net:10000 \
          NEXT_PUBLIC_WEB_URL=https://agent-vps.tailf4690b.ts.net npx next dev -H 0.0.0.0
```

The dev app client must list `https://agent-vps.tailf4690b.ts.net/login/callback/` as callback URL
(it does). Note JO-71: with `reactStrictMode: true` the dashboard never renders data in dev until
swr is upgraded (JO-27); flip it off locally, do not commit that.

## Rollout runbook (prod)

Zero-downtime order: prepare the pool while the old web still runs, deploy, then close the old flows.

1. **Before the merge, on a Heroku dyno** (real prod credentials, never on the VPS):
   ```
   heroku run -a icruiting-api -- node dist/src/scripts/backfillEmailVerified.js eu-central-1_WK7ijcvLY --apply
   heroku run -a icruiting-api -- node dist/src/scripts/configurePool.js eu-central-1_WK7ijcvLY 6fb5ic9a0vkrb1osaunksajjgn --apply --keep-password-flows
   ```
   Backfill: every invited user gets a verified e-mail, pending invites become CONFIRMED. Pool: Essentials,
   `EMAIL_OTP` allowed, `USER_AUTH` added *next to* the old password flows, LEGACY existence errors. The
   deployed (old) web keeps working; nothing changes for users yet. Both scripts print a dry run without
   `--apply` — keep that output, it is the rollback reference.
2. **Merge the PR.** Netlify builds the web (login = e-mail code / Google), the Heroku workflow deploys the
   server (invites, guards). Existing sessions stay valid; the refresh-token flow is untouched.
3. **Right after the merge:**
   ```
   cd server && yarn lambda:deploy      # icruiting-dev key in the env; shared by both pools
   heroku run -a icruiting-api -- node dist/src/scripts/configurePool.js eu-central-1_WK7ijcvLY 6fb5ic9a0vkrb1osaunksajjgn --apply
   ```
   From now on uninvited Google logins are rejected and the app client no longer accepts passwords.
4. **SES for prod mail** (can precede everything; only the last step depends on it): create the sender
   identity for `icruiting.at` (SESv2 `CreateEmailIdentity`), add the three DKIM CNAMEs at GoDaddy, leave
   the SES sandbox (console → request production access), then set the prod pool's `EmailConfiguration`
   to `DEVELOPER` with that identity's ARN. Until then Cognito's own sender applies: 50 mails/day/pool.

Rollback: the previous Lambda source is in `infra/lambda/linkProviders/original/`; pool and client
settings before the change are printed by the scripts' dry runs — keep that output.
