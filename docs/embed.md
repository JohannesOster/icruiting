# Embedded forms

Customers put applicant forms on their own sites with a snippet copied from the form builder
(`web/src/pages/dashboard/formbuilder.tsx`): an iframe of `<API>/forms/<formId>/html` plus a
listener that sets the iframe's height from `postMessage`s the form sends
(`server/src/infrastructure/http/views/ic-iframe-resize.js`). The job page's "Direktlink" points at
the same URL. Both take the host from `NEXT_PUBLIC_API_URL`, which every non-development web build
requires (`web/src/config.ts`); production uses `https://api.icruiting.at`.

## Two generations of snippet are live

| Copied       | iframe host                         | Listener accepts heights from                            |
| ------------ | ----------------------------------- | -------------------------------------------------------- |
| before JO-48 | `icruiting-api.herokuapp.com`       | `event.origin === "https://icruiting-api.herokuapp.com"` |
| since JO-48  | `NEXT_PUBLIC_API_URL` at build time | `event.source === iframe.contentWindow` (any host)       |

Pasted snippets never update, so old ones stay in customer pages until each customer re-pastes
(JO-49). Both hosts reach the same Heroku app, so both generations work
unchanged. The form posts back to the URL it was loaded from (JO-46), and the server builds no
absolute URLs.

## Rules

- **Never redirect `icruiting-api.herokuapp.com`.** A redirect would still load the form, but its
  height messages would come from the new origin, so old listeners would ignore them and the
  iframe would stay at its default height of about 150 px.
- **If the API leaves Heroku**, keep `icruiting-api.herokuapp.com` answering with a reverse proxy
  app on Heroku that forwards to the new host. A proxy keeps the browser on the old origin; a
  redirect doesn't. Run it on a Basic dyno, because an Eco dyno sleeps and the iframe would stay
  blank for about 10 s. Drop the proxy once the JO-47 log line (`host=` per public form request)
  shows no traffic on that host.
- New snippets don't depend on the host, so moving `api.icruiting.at` (DNS, redirect or proxy)
  only needs the iframe URL to keep resolving.
