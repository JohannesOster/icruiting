import {API} from 'services';
import config from './config';

const getAuthHeader = async (): Promise<{Authorization?: string}> => {
  return API.auth
    .token()
    .then((token) => ({Authorization: `Bearer ${token}`}))
    .catch(() => ({}));
};

export default {
  Auth: {
    region: config.region,
    userPoolId: config.userPoolId,
    identityPoolId: config.identityPoolId,
    userPoolWebClientId: config.userPoolWebClientId,
  },
  API: {
    endpoints: [
      {
        name: config.endpoint.name,
        endpoint: config.endpoint.url,
        custom_header: getAuthHeader,
      },
    ],
  },
};
