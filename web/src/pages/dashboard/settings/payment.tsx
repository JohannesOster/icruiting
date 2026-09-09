import React, {useState} from 'react';
import {
  Box,
  HeadingL,
  DataTable,
  TColumn,
  FlexGrid,
  Typography,
  getDashboardLayout,
} from 'components';
import {PaymentMethodForm} from 'containers';
import {useTheme} from 'styled-components';
import {useAuth, useToaster} from 'context';
import {Button, Dialog} from 'components';
import {API} from 'services';
import {loadStripe} from '@stripe/stripe-js';
import {Elements, useElements, useStripe, IbanElement} from '@stripe/react-stripe-js';
import {withAdmin} from 'components';
import {useFetch, mutate} from 'components/useFetch';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
const PaymentMethods: React.FC = () => {
  const {spacing} = useTheme();
  const {currentUser} = useAuth();
  const {danger, success} = useToaster();
  const stripe = useStripe();
  const elements = useElements();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchesClientSecret, setFetchesClientSecret] = useState(false);

  const {data, error} = useFetch(
    [`GET /tenants/${currentUser?.tenantId}/paymentMethods`, currentUser?.tenantId],
    (_key, tenantId) => API.tenants.paymentMethods.list(tenantId),
  );

  const onSubmit = async (values: any) => {
    if (!(stripe && elements && clientSecret)) return;

    try {
      const iban = elements.getElement(IbanElement);
      if (!iban) {
        throw new Error('Ein unbekannter Fehler ist aufgetreten, bitte versuchen Sie es erneut.');
      }

      const {error, setupIntent} = await stripe.confirmSepaDebitSetup(clientSecret, {
        payment_method: {
          sepa_debit: iban,
          billing_details: {name: values.name, email: values.email},
        },
      });

      if (error) throw error;

      await API.tenants.paymentMethods.setDefault(
        currentUser?.tenantId || '',
        (setupIntent?.payment_method || '') as any as string,
      );

      mutate([`GET /tenants/${currentUser?.tenantId}/paymentMethods`, currentUser?.tenantId]);
      iban.clear();
      success('Zahlungsmethode erfolgreich hinzugefügt');
    } catch (error) {
      danger(
        error.message || 'Ein unbekannter Fehler ist aufgetreten, bitte versuchen Sie es erneut.',
      );
    }
    setClientSecret(null);
  };

  const columns: TColumn[] = [
    {
      title: 'Bankkonto',
      cell: ({sepa_debit}) => `SEPA •••• ${sepa_debit.last4}`,
    },
    {
      title: 'Standard',
      cell: ({is_default}) => (is_default ? 'Standard' : '-'),
    },
    {
      title: 'Aktion',
      cell: ({is_default, id}) => (
        <FlexGrid gap={spacing.scale200}>
          {!is_default && (
            <Button
              kind="minimal"
              onClick={async () => {
                setUpdatingId(id);
                await API.tenants.paymentMethods
                  .setDefault(currentUser?.tenantId || '', id)
                  .then(() => {
                    mutate([
                      `GET /tenants/${currentUser?.tenantId}/paymentMethods`,
                      currentUser?.tenantId,
                    ]);
                  })
                  .catch(console.error)
                  .finally(() => setUpdatingId(null));
              }}
              isLoading={updatingId === id}
            >
              als Standard festlegen
            </Button>
          )}
          {!is_default && <Typography>/</Typography>}
          <Button
            kind="minimal"
            onClick={() => {
              setDeletingId(id);
              API.tenants.paymentMethods
                .del(currentUser?.tenantId || '', id)
                .then(() => {
                  mutate([
                    `GET /tenants/${currentUser?.tenantId}/paymentMethods`,
                    currentUser?.tenantId,
                  ]);
                })
                .then(() => success('Zahlungsmethode erfolgreich entfernt'))
                .catch((error) => danger(error.message))
                .finally(() => setDeletingId(null));
            }}
            isLoading={deletingId === id}
          >
            entfernen
          </Button>
        </FlexGrid>
      ),
    },
  ];

  return (
    <Box
      margin={`${spacing.scale300} ${spacing.scale500}`}
      display="grid"
      rowGap={spacing.scale500}
    >
      <FlexGrid justifyContent="space-between" flexGap={spacing.scale200}>
        <HeadingL>Paymentmethods</HeadingL>
        <Button
          onClick={() => {
            setFetchesClientSecret(true);
            API.tenants.paymentMethods
              .getSetupIntent(currentUser?.tenantId || '')
              .then((clientSecret) => setClientSecret(clientSecret))
              .catch((error) => danger(error.message))
              .finally(() => setFetchesClientSecret(false));
          }}
          isLoading={fetchesClientSecret}
        >
          Neue Zahlungsmethode
        </Button>
      </FlexGrid>
      <DataTable columns={columns} data={data || []} isLoading={!(data || error)} />
      {clientSecret && (
        <Dialog onClose={() => setClientSecret(null)} title="Bankkonto hinzufügen">
          <PaymentMethodForm onSubmit={onSubmit} />
        </Dialog>
      )}
    </Box>
  );
};

const Wrapper = (props: any) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentMethods {...props} />
    </Elements>
  );
};

Wrapper.getLayout = getDashboardLayout;
export default withAdmin(Wrapper);
