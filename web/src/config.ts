const config = {
  development: {
    region: 'eu-central-1',
    userPoolId: 'eu-central-1_MeIKYtqcU',
    identityPoolId: 'eu-central-1:e106c55b-c311-40d9-a7dd-bcd5d668ad2a',
    userPoolWebClientId: '3n7mi9c40kr8sp0tuoo6udvfi0',
    endpoint: {name: 'icruiting-api', url: 'http://localhost:5000'},
    loginCallbackUrl: 'http://localhost:3000/login/callback/',
    logoutCallbackUrl: 'http://localhost:3000/logout/',
    userPoolDomain:
      'https://icruiting-web-dev.auth.eu-central-1.amazoncognito.com',
    discordContactWebHook:
      'https://discord.com/api/webhooks/1091469616921981119/xr8rE7R8tY3AhysM3Tg2_Z0mocAUQS5WyPwGBuAmLQvRzpuN_tASqWEvlKIz6dPZtCRo',
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
    userPoolDomain:
      'https://icruiting-web-prod.auth.eu-central-1.amazoncognito.com',
    discordContactWebHook:
      'https://discord.com/api/webhooks/1091469616921981119/xr8rE7R8tY3AhysM3Tg2_Z0mocAUQS5WyPwGBuAmLQvRzpuN_tASqWEvlKIz6dPZtCRo',
  },
};

const env = process.env.NEXT_PUBLIC_APP_ENV || 'development';
export default config[env];
