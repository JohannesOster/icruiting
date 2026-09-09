import {get} from '../objGet';

describe('get', () => {
  it('returns non nested value', () => {
    const val = 'value';
    const obj = {key: val};
    const path = 'key';

    expect(get(obj, path, '')).toBe(val);
  });

  it('returns nested value using dot-notation', () => {
    const val = 'value';
    const obj = {key1: {key2: {key3: val}}};
    const path = 'key1.key2.key3';

    expect(get(obj, path, '')).toBe(val);
  });

  it('returns nested value using [] - notation', () => {
    const val = 'value';
    const obj = {key1: {key2: [{key3: val}]}};
    const path = 'key1.key2[0].key3';

    expect(get(obj, path, '')).toBe(val);
  });

  it('returns default for invalid path using dot - notation', () => {
    const val = 'value';
    const defaultValue = 'default value';
    const obj = {key1: {key2: [{key3: val}]}};
    const invalidPath = 'key1.invalid.key3';

    expect(get(obj, invalidPath, defaultValue)).toBe(defaultValue);
  });

  it('returns default for invalid path using [] - notation', () => {
    const val = 'value';
    const defaultValue = 'default value';
    const obj = {key1: {key2: [{key3: val}]}};
    const invalidPath = 'key1.key2[5].key3';

    expect(get(obj, invalidPath, defaultValue)).toBe(defaultValue);
  });
});
