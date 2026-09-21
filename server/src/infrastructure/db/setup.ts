import db from '.';
import {dbMigrate} from './migrate';
import config from 'config';

export const createAll = async () => dbMigrate('update');
/**
 * Only ever against a throwaway database: the integration teardown calls this, and env vars
 * (e.g. a sourced .env.development) override .env.test — which once emptied icruiting_dev.
 */
export const dropAll = async () => {
  const names = [config.get('db.url'), config.get('liquibase.url')].map(
    (url) => (url || '').split('/').pop() || '',
  );
  if (!names.every((name) => /test/i.test(name))) {
    throw new Error(
      `Refusing drop-all: database names must contain "test" (got ${names.join(', ')})`,
    );
  }
  return dbMigrate('drop-all');
};
export const endConnection = () => db.$pool.end();
export const truncateAllTables = () => db.any('TRUNCATE tenant CASCADE;');
