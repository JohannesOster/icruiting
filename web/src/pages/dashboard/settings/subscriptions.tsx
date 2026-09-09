import React, {useState} from 'react';
import {Box, HeadingL, DataTable, TColumn, getDashboardLayout} from 'components';
import {useTheme} from 'styled-components';
import {useAuth, useToaster} from 'context';
import {API} from 'services';
import {Button, withAdmin} from 'components';
import {useFetch, mutate} from 'components/useFetch';

const Subscriptions = () => {
  const {spacing} = useTheme();
  const {currentUser} = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const {danger, success} = useToaster();

  const {data: prices, error: pricesError} = useFetch('GET /stripe/prices', API.stripe.prices.list);

  const {data: subscriptions, error: subscriptionsError} = useFetch(
    [`GET /tenants/${currentUser?.tenantId}/subscriptions`, currentUser?.tenantId],
    (_key, tenantId) => API.tenants.subscriptions.list(tenantId),
  );

  const displayValForInterval = {month: 'Monat'} as {[key: string]: string};

  const columns: TColumn[] = [
    {title: 'Name', cell: ({product}) => product.name},
    {
      title: 'Preis',
      cell: ({unit_amount, recurring}) => `€ ${unit_amount / 100} /
    ${displayValForInterval[recurring.interval]}`,
    },
    {
      title: 'Status',
      cell: ({id}) => {
        const sub = subscriptions?.find(({plan}) => plan.id === id);
        if (!sub) return '-';
        return sub.status;
      },
    },
    {
      title: 'Aktion',
      cell: ({id}) => {
        const sub = subscriptions?.find(({plan}) => plan.id === id);
        if (!sub)
          return (
            <Button
              kind="minimal"
              onClick={async () => {
                setAddingId(id);
                await API.tenants.subscriptions
                  .create(currentUser?.tenantId || '', id)
                  .then(() => {
                    mutate([
                      `GET /tenants/${currentUser?.tenantId}/subscriptions`,
                      currentUser?.tenantId,
                    ]);
                  })
                  .then(() => success('Subscription erfolgreich ausgewhält.'))
                  .catch((error) => danger(error.message))
                  .finally(() => setDeletingId(null));
              }}
              isLoading={addingId === id}
            >
              auswählen
            </Button>
          );
        return (
          <Button
            kind="minimal"
            onClick={() => {
              setDeletingId(id);
              API.tenants.subscriptions
                .del(currentUser?.tenantId || '', sub.id)
                .then(() => {
                  mutate([
                    `GET /tenants/${currentUser?.tenantId}/subscriptions`,
                    currentUser?.tenantId,
                  ]);
                })
                .then(() => success('Subscription erfolgreich beendet.'))
                .catch((error) => danger(error.message))
                .finally(() => setDeletingId(null));
            }}
            isLoading={deletingId === id}
          >
            beenden
          </Button>
        );
      },
    },
  ];

  return (
    <Box
      margin={`${spacing.scale300} ${spacing.scale500}`}
      display="grid"
      rowGap={spacing.scale500}
    >
      <HeadingL>Subscriptions</HeadingL>
      <DataTable
        columns={columns}
        data={prices || []}
        isLoading={!(prices || subscriptions) && !(pricesError || subscriptionsError)}
      />
    </Box>
  );
};

Subscriptions.getLayout = getDashboardLayout;
export default withAdmin(Subscriptions);
