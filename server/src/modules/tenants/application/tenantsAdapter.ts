import {BaseError} from 'application';
import {httpReqHandler} from 'shared/infrastructure/http';
import paymentService from 'shared/infrastructure/services/paymentService';
import authService from 'shared/infrastructure/services/authService';
import storageService from 'shared/infrastructure/services/storageService';
import {filterNotNullAndDefined} from 'utils/filterNotNullAndDefined';
import {DB} from '../infrastructure/repositories';
import {createTenant} from '../domain';
import {tenantsMapper} from '../mappers';
import logger from 'shared/infrastructure/logger';

export const TenantsAdapter = (db: DB) => {
  const retrieve = httpReqHandler(async (req) => {
    const {tenantId} = req.user;
    const tenant = await db.tenants.retrieve(tenantId);
    if (!tenant) throw new BaseError(404, 'Tenant Not Found');
    if (tenant.theme) tenant.theme = await storageService.getUrl(tenant.theme);

    return {body: tenant};
  });

  const del = httpReqHandler(async (req) => {
    const {tenantId} = req.user;
    const tenant = await db.tenants.retrieve(tenantId);
    if (!tenant) throw new BaseError(404, 'Tenant Not Found');
    if (tenant.stripeCustomerId) await paymentService.customers.del(tenant.stripeCustomerId);

    _deleteTenantFiles(tenantId);

    const users = await authService.listUsers(tenantId);
    if (users.length) {
      const promises = users.map(({email}) => authService.deleteUser(email));
      await Promise.all(promises);
    }

    await db.tenants.del(tenantId);

    return {};
  });

  const _deleteTenantFiles = async (tenantId: string) => {
    const files = await storageService.list(tenantId);
    if (!files?.length) return {};

    const keys = files.map(({Key}) => Key).filter(filterNotNullAndDefined);
    await storageService.bulkDel(keys);
  };

  return {retrieve, del};
};
