import {FormSubmissionsRepository} from 'modules/formSubmissions/infrastructure/repositories/formSubmissions';
import {TenantsRepository} from 'modules/tenants/infrastructure/repositories/tenantsRepository';
import {DBAccess} from 'shared/infrastructure/http';

export interface DB extends ReturnType<typeof initializeRepositories> {}

export const initializeRepositories = (dbAccess: DBAccess) => {
  return {
    formSubmissions: FormSubmissionsRepository(dbAccess),
    tenants: TenantsRepository(dbAccess),
  };
};
