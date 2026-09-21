import React from 'react';
import {email} from 'utils/form-validation';
import {object} from 'yup';
import {useForm} from 'react-hook-form';
import {AuthForm, Button, Input, Typography} from 'components';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';
import {GoogleLoginButton} from './GoogleLoginButton';

export type EmailFormValues = {email: string};

type Props = {onSubmit: (values: EmailFormValues) => void};

/** Step 1 of the passwordless login: ask for the e-mail, Cognito sends a one-time code. */
export const EmailForm: React.FC<Props> = ({onSubmit}) => {
  const {register, errors, formState, handleSubmit} = useForm<EmailFormValues>({
    mode: 'onChange',
    resolver: yupResolver(object({email})),
    criteriaMode: 'all',
  });

  return (
    <AuthForm title="Anmelden" onSubmit={handleSubmit(onSubmit)}>
      <Typography kind="secondary">
        Kein Passwort nötig: Wir schicken dir einen Anmeldecode an deine E-Mail-Adresse.
      </Typography>
      <Input
        autoFocus
        label="E-Mail-Adresse"
        placeholder="E-Mail-Adresse"
        type="email"
        name="email"
        autoComplete="email"
        ref={register}
        errors={errorsFor(errors, 'email')}
      />
      <span style={{margin: '0 auto'}}>
        <Button
          disabled={!formState.isValid || !Object.keys(formState.touched).length}
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Anmeldecode senden
        </Button>
      </span>
      <GoogleLoginButton />
    </AuthForm>
  );
};
