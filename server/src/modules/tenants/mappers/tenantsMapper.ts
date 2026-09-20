import {Tenant as TenantEntity} from '../domain';
import {DBTenant} from '../infrastructure/repositories/tenantsRepository';

const toPersistance = (tenant: TenantEntity): DBTenant => {
  const {id: tenantId, ..._tenant} = tenant;
  return Object.freeze({tenantId, ..._tenant});
};

/**
 * The client-facing shape: renames id → tenantId and drops the Stripe customer id,
 * which is only used server-side.
 */
const toDTO = (tenant: TenantEntity) => {
  const {id: tenantId, stripeCustomerId: _stripeCustomerId, ..._tenant} = tenant;
  return Object.freeze({tenantId, ..._tenant});
};

export const tenantsMapper = {toPersistance, toDTO};
