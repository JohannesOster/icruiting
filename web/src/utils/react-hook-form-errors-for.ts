import {get} from './objGet';

export const errorsFor = (errors: any, path: string) => {
  path = path + '.types';
  const types = get(errors, path, null);
  if (!types) return [];

  const result = [];
  for (const key of Object.keys(types)) {
    result.push(get(errors, path + '.' + key, '').toString());
  }

  return result;
};
