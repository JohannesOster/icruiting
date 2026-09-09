import {API} from 'aws-amplify';

const api = 'icruiting-api';

const request = {
  get: <T = any>(path: string, init = {}): Promise<T> =>
    API.get(api, path, init),
  post: <T = any>(path: string, init = {}): Promise<T> =>
    API.post(api, path, init),
  put: <T = any>(path: string, init = {}): Promise<T> =>
    API.put(api, path, init),
  del: <T = any>(path: string, init = {}): Promise<T> =>
    API.del(api, path, init),
};

export default request;
