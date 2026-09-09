import React, {useEffect, useState} from 'react';
import {Box, HeadingS, Typography, Spinner} from 'components';
import {SignUpForm, SignUpFormValues} from 'containers';
import {useRouter} from 'next/router';
import {useToaster} from 'context';
import {API} from 'services';
import {useTheme} from 'styled-components';
import {useFetch} from 'components/useFetch';

type Status = 'idle' | 'fetching' | 'submitting';
const SignUp: React.FC = () => {
  const {spacing} = useTheme();
  const router = useRouter();
  const toaster = useToaster();
  const [status, setStatus] = useState<Status>('fetching');
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const {data: prices, error} = useFetch('GET /stripe/prices', API.stripe.prices.list);

  useEffect(() => {
    if (!(prices || error)) return;
    setStatus('idle');
  }, [prices]);

  useEffect(() => {
    if (prices?.length) setSelectedPriceId(prices[prices.length - 1].id);
  }, [prices]);

  const onSubmit = async ({tenantName, email, password}: SignUpFormValues) => {
    setStatus('submitting');

    try {
      if (!selectedPriceId) throw new Error('Fehlende Subscriptionsauswahl');

      await API.tenants.create({
        tenantName,
        email,
        password,
        stripePriceId: selectedPriceId,
      });

      toaster.success('Erfolgreich registriert. Bestätigen Sie bitte Ihre E-Mail-Adresse!');

      router.push('/login');
    } catch (err) {
      toaster.danger(err.message);
      setStatus('idle');
    }
  };

  const displayValForInterval = {month: 'Monat'} as {[key: string]: string};

  return (
    <Box margin="0 auto" padding="132px 0">
      {status === 'fetching' && !prices?.length && (
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
          <Spinner />
        </Box>
      )}
      <Box
        display="grid"
        gridAutoFlow="column"
        justifyContent="center"
        columnGap={spacing.scale500}
      >
        {prices?.map((price) => (
          <div key={price.id} onClick={() => setSelectedPriceId(price.id)}>
            <Box
              border={`1px solid ${selectedPriceId === price.id ? 'black' : 'lightgray'}`}
              cursor="pointer"
              transform={selectedPriceId === price.id ? 'scale(1.1)' : 'scale(1)'}
              transition="all 0.1s"
              boxShadow={
                selectedPriceId === price.id
                  ? '0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04)'
                  : 'none'
              }
            >
              <div style={{borderTop: '5px solid black'}} />
              <Box
                padding={spacing.scale500}
                textAlign="center"
                display="grid"
                rowGap={spacing.scale700}
              >
                <HeadingS>{price.product.name}</HeadingS>
                <Typography kind="secondary" style={{fontSize: spacing.scale500}}>
                  € {price.unit_amount / 100} / {displayValForInterval[price.recurring.interval]}
                </Typography>
                <Box display="grid" rowGap={spacing.scale300}>
                  <Typography kind="secondary" style={{fontSize: spacing.scale500}}>
                    14 Tage Trial
                  </Typography>
                  <Typography kind="secondary" style={{fontSize: spacing.scale300}}>
                    <strong>Keine Zahlungsmethode</strong>
                    <br />
                    notwendig
                  </Typography>
                </Box>
              </Box>
            </Box>
          </div>
        ))}
      </Box>
      <Box marginTop="-100px">
        {selectedPriceId && <SignUpForm onSubmit={onSubmit} submitting={status === 'submitting'} />}
      </Box>
    </Box>
  );
};

export default SignUp;
