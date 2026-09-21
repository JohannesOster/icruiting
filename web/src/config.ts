const config = {
  development: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_MeIKYtqcU',
    identityPoolId: 'eu-central-1:e106c55b-c311-40d9-a7dd-bcd5d668ad2a',
    userPoolWebClientId: '3n7mi9c40kr8sp0tuoo6udvfi0',
    endpoint: {name: 'icruiting-api', url: 'http://localhost:5000'},
    loginCallbackUrl: 'http://localhost:3000/login/callback/',
    logoutCallbackUrl: 'http://localhost:3000/logout/',
    userPoolDomain: 'https://icruiting-web-dev.auth.eu-central-1.amazoncognito.com',
  },
  production: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_WK7ijcvLY',
    identityPoolId: 'eu-central-1:e8a4c58f-7215-4447-bbff-b50a8d7a4842',
    userPoolWebClientId: '6fb5ic9a0vkrb1osaunksajjgn',
    endpoint: {
      name: 'icruiting-api',
      url: 'https://icruiting-api.herokuapp.com',
    },
    loginCallbackUrl: 'https://icruiting.at/login/callback/',
    logoutCallbackUrl: 'https://icruiting.at/logout/',
    userPoolDomain: 'https://icruiting-web-prod.auth.eu-central-1.amazoncognito.com',
  },
};

const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';
const selected = config[env];

// Optional overrides so a dev server can be reached from another host, e.g. over the tailnet (JO-69):
//   NEXT_PUBLIC_API_URL=https://agent-vps.tailf4690b.ts.net:10000 NEXT_PUBLIC_WEB_URL=https://agent-vps.tailf4690b.ts.net
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

export default {
  ...selected,
  endpoint: {...selected.endpoint, url: apiUrl || selected.endpoint.url},
  loginCallbackUrl: webUrl ? `${webUrl}/login/callback/` : selected.loginCallbackUrl,
  logoutCallbackUrl: webUrl ? `${webUrl}/logout/` : selected.logoutCallbackUrl,
};
