import db from '.';
import {dbMigrate} from './migrate';
import config from 'config';

export const createAll = async () => dbMigrate('update');
/**
 * Only ever against a throwaway database: the integration teardown calls this, and env vars
 * (e.g. a sourced .env.development) override .env.test — which once emptied icruiting_dev.
 */
export const dropAll = async () => {
  const url = config.get('database.url') as string;
  if (!/test/i.test(url.split('/').pop() || '')) {
    throw new Error(
      `Refusing drop-all: database name in DATABASE_URL does not contain "test" (${url.replace(/:[^:@/]+@/, ':***@')})`,
    );
  }
  return dbMigrate('drop-all');
};
export const endConnection = () => db.$pool.end();
export const truncateAllTables = () => db.any('TRUNCATE tenant CASCADE;');
