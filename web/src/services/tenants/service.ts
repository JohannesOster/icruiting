import API from '../request';

export const Tenants = () => {
  interface createTenantParams {
    tenantName: string;
    email: string;
    password: string;
    stripePriceId: string;
  }
  const create = (body: createTenantParams): Promise<any> => {
    return API.post('/tenants', {body});
  };

  const find = (
    tenantId: string,
  ): Promise<{
    tenantId: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripeSubscriptionStatus?: string;
    tenantName: string;
    theme?: string;
    createdAt: string;
  }> => {
    return API.get(`/tenants/${tenantId}`);
  };

  const del = (tenantId: string): Promise<undefined> => {
    return API.del(`/tenants/${tenantId}`);
  };

  const listPaymentMethods = (tenantId: string): Promise<any[]> => {
    return API.get(`/tenants/${tenantId}/paymentMethods`);
  };

  const getSetupIntent = (tenantId: string): Promise<string> => {
    return API.get(`/tenants/${tenantId}/paymentMethods/setupIntent`);
  };

  const setDefaultPaymentMethod = (
    tenantId: string,
    paymentMethodId: string,
  ): Promise<any> => {
    return API.post(`/tenants/${tenantId}/paymentMethods/default`, {
      body: {paymentMethodId},
    });
  };

  const delPaymentMethod = (
    tenantId: string,
    paymentMethodId: string,
  ): Promise<undefined> => {
    return API.del(`/tenants/${tenantId}/paymentMethods/${paymentMethodId}`);
  };

  const listSubscriptions = (tenantId: string): Promise<any[]> => {
    return API.get(`/tenants/${tenantId}/subscriptions`);
  };

  const delSubscription = (
    tenantId: string,
    subscriptionId: string,
  ): Promise<any> => {
    return API.del(`/tenants/${tenantId}/subscriptions/${subscriptionId}`);
  };

  const createSubscription = (
    tenantId: string,
    priceId: string,
  ): Promise<any> => {
    return API.post(`/tenants/${tenantId}/subscriptions/`, {
      body: {priceId},
    });
  };

  const delCurrentTheme = (tenantId: string): Promise<undefined> => {
    return API.del(`/tenants/${tenantId}/themes`);
  };

  return {
    create,
    find,
    del,
    paymentMethods: {
      list: listPaymentMethods,
      getSetupIntent,
      setDefault: setDefaultPaymentMethod,
      del: delPaymentMethod,
    },
    subscriptions: {
      list: listSubscriptions,
      del: delSubscription,
      create: createSubscription,
    },
    themes: {del: delCurrentTheme},
  };
};
