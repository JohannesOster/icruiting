const config = {
  development: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_MeIKYtqcU',
    identityPoolId: 'eu-central-1:e106c55b-c311-40d9-a7dd-bcd5d668ad2a',
    userPoolWebClientId: '3n7mi9c40kr8sp0tuoo6udvfi0',
    loginCallbackUrl: 'http://localhost:3000/login/callback/',
    logoutCallbackUrl: 'http://localhost:3000/logout/',
    userPoolDomain: 'https://icruiting-web-dev.auth.eu-central-1.amazoncognito.com',
  },
  production: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_WK7ijcvLY',
    identityPoolId: 'eu-central-1:e8a4c58f-7215-4447-bbff-b50a8d7a4842',
    userPoolWebClientId: '6fb5ic9a0vkrb1osaunksajjgn',
    loginCallbackUrl: 'https://icruiting.at/login/callback/',
    logoutCallbackUrl: 'https://icruiting.at/logout/',
    userPoolDomain: 'https://icruiting-web-prod.auth.eu-central-1.amazoncognito.com',
  },
};

const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';
const selected = config[env];

// The API URL: what the dashboard calls, and what embed snippets and form links hand out to
// customers. Set it with NEXT_PUBLIC_API_URL (inlined at build time, so a change needs a rebuild);
// only development falls back to the local server. Any other env without it fails the build rather
// than ship a stale host into new snippets (JO-48). Production: https://api.icruiting.at.
const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || (env === 'development' ? 'http://localhost:5000' : undefined);
if (!apiUrl) {
  throw new Error(`NEXT_PUBLIC_API_URL must be set when NEXT_PUBLIC_APP_ENV=${env}`);
}

// Optional override so a dev server can be reached from another host, e.g. over the tailnet (JO-69):
//   NEXT_PUBLIC_API_URL=https://agent-vps.tailf4690b.ts.net:10000 NEXT_PUBLIC_WEB_URL=https://agent-vps.tailf4690b.ts.net
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export default {
  ...selected,
  endpoint: {name: 'icruiting-api', url: apiUrl},
  loginCallbackUrl: webUrl ? `${webUrl}/login/callback/` : selected.loginCallbackUrl,
  logoutCallbackUrl: webUrl ? `${webUrl}/logout/` : selected.logoutCallbackUrl,
};
