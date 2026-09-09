import API from '../request';

export const Stripe = () => {
  type Price = any;
  const listPrices = (): Promise<Price[]> => {
    return API.get<Price[]>('/subscriptions').then((result) => {
      return result.sort((a, b) => (a.unit_amount < b.unit_amount ? -1 : 1));
    });
  };
  return {prices: {list: listPrices}};
};
