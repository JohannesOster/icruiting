import {BaseError} from 'application';
import express from 'express';
import {subsCreateRules} from './validation';
import {
  RouterFactory,
  requireAuth,
  requireAdmin,
  requireSubscription,
  validate,
} from 'shared/infrastructure/http';
import {initializeRepositories} from '../repositories';
import {
  PaymentMethodsAdapter,
  SubscriptionsAdapter,
  TenantsAdapter,
  ThemesAdapter,
} from '../../application';

export const SIGNUP_DISABLED_MESSAGE =
  'Die Registrierung neuer Organisationen ist deaktiviert. Bitte wenden Sie sich an den Administrator Ihrer Organisation oder an johannes.oster@icruiting.at.';

export const TenantsRouter: RouterFactory = (dbAccess) => {
  const db = initializeRepositories(dbAccess);

  const tenantsAdapter = TenantsAdapter(db);
  const themesAdapter = ThemesAdapter(db);
  const subsAdapter = SubscriptionsAdapter();
  const subsURL = '/:tenantId/subscriptions';
  const pMAdapter = PaymentMethodsAdapter();
  const paymentURL = '/:tenantId/paymentMethods';
  const router = express.Router();

  // Self-service signup is disabled (JO-67): organisations are onboarded by hand.
  router.post('/', () => {
    throw new BaseError(403, SIGNUP_DISABLED_MESSAGE);
  });

  router.use(requireAuth);
  router.use(requireAdmin);
  router.delete('/:tenantId', tenantsAdapter.del);
  router.get('/:tenantId', tenantsAdapter.retrieve);

  router.use(requireSubscription);

  router.post('/:tenantId/themes/', themesAdapter.upload);
  router.delete('/:tenantId/themes', themesAdapter.del);

  router.post(subsURL, subsCreateRules, validate, subsAdapter.create);
  router.get(subsURL, subsAdapter.retrieve);
  router.delete(subsURL + '/:subscriptionId', subsAdapter.del);

  router.get(paymentURL, pMAdapter.list);
  router.get(`${paymentURL}/setupIntent`, pMAdapter.getSetupIntent);
  router.post(`${paymentURL}/default`, pMAdapter.setDefaultPaymentMethod);
  router.delete(`${paymentURL}/:paymentMethodId`, pMAdapter.del);

  return router;
};
