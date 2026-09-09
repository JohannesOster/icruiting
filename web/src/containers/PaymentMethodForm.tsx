import React, {FC} from 'react';
import {IbanElement} from '@stripe/react-stripe-js';
import {useAuth} from 'context';
import {Box, DialogBody, DialogFooter, Typography} from 'components';
import styled, {useTheme} from 'styled-components';
import {Input, Button} from 'components';
import {useForm} from 'react-hook-form';

const CardContainer = styled.div`
  border: 1px solid;
  border-color: ${({theme}) => theme.colors.inputBorder};
  padding: ${({theme}) => theme.spacing.scale300};
  min-width: 400px;
`;

type Props = {
  onSubmit: (values: any) => void;
};

export const PaymentMethodForm: FC<Props> = ({onSubmit}) => {
  const {currentUser} = useAuth();
  const {spacing} = useTheme();

  const {register, handleSubmit, formState} = useForm({
    defaultValues: {email: currentUser?.email},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <DialogBody>
        <Box display="grid" rowGap={spacing.scale300}>
          <Input
            label="E-Mail-Adresse"
            placeholder="E-Mail-Adresse"
            name="email"
            ref={register}
            required
          />
          <Input
            label="Vollständiger Name"
            placeholder="Vollständiger Name"
            name="name"
            ref={register}
            required
          />
          <Box display="grid" rowGap={spacing.scale200}>
            <label>
              <Typography>IBAN*</Typography>
            </label>
            <CardContainer>
              <IbanElement options={{supportedCountries: ['SEPA'], placeholderCountry: 'AT'}} />
            </CardContainer>
          </Box>
        </Box>
      </DialogBody>
      <DialogFooter>
        <Button type="submit" isLoading={formState.isSubmitting}>
          Speichern
        </Button>
      </DialogFooter>
    </form>
  );
};
