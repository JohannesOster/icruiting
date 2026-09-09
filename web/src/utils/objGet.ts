/* Normalize path to only use dot notation
 * (change path[1].path to path.1.path) */
const normalizePath = (path: string) => {
  if (!path) return '';
  /* If the first path element is [] indexed
   * it cannot be replaced by . but must be removed */
  if (path[0] === '[') path = path.substr(1);
  return path.replace('[', '.').replace(']', '');
};

export const get = (
  obj: any,
  path: string,
  defaultValue: any = undefined,
): any => {
  const result = normalizePath(path)
    .split('.')
    .filter(Boolean)
    .reduce((acc, curr) => (acc ? acc[curr] : acc), obj);
  return result === undefined || result === obj ? defaultValue : result;
};
