import React from 'react';
import {Button, Input} from 'components';
import {AuthForm, Typography} from 'components';
import Link from 'next/link';
import {useForm} from 'react-hook-form';
import {email} from 'utils/form-validation';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {useTheme} from 'styled-components';
import {yupResolver} from '@hookform/resolvers';
import {object, string} from 'yup';
import styles from './googleBtn.module.css';
import config from 'config';

export type LoginFormValues = {
  email: string;
  password: string;
};

type Props = {
  onSubmit: (values: LoginFormValues) => void;
};

export const LoginForm: React.FC<Props> = ({onSubmit}) => {
  const {spacing, colors} = useTheme();
  const {register, errors, formState, handleSubmit} = useForm<LoginFormValues>({
    mode: 'onChange',
    resolver: yupResolver(
      object({
        email,
        password: string().required('Passwort ist verpflichtend.'),
      }),
    ),
    criteriaMode: 'all',
  });

  return (
    <AuthForm title="Anmelden" onSubmit={handleSubmit(onSubmit)}>
      <Input
        autoFocus
        label="E-Mail-Adresse"
        placeholder="E-Mail-Adresse"
        type="email"
        name="email"
        ref={register}
        errors={errorsFor(errors, 'email')}
        required
      />
      <Input
        type="password"
        name="password"
        label="Passwort"
        placeholder="Passwort"
        ref={register}
        errors={errorsFor(errors, 'password')}
        required
      />
      <Typography kind="secondary">
        <span style={{marginRight: spacing.scale200}}>Passwort vergessen?</span>
        <Link href="/password-reset">Passwort zurücksetzen?</Link>
      </Typography>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: spacing.scale500,
          justifyContent: 'space-between',
          columnGap: spacing.scale200,
        }}
      >
        <Typography kind="secondary">
          <span style={{marginRight: spacing.scale200}}>Noch keinen Account?</span>
          <Link href="/signup">Registrieren</Link>
        </Typography>
        <Button
          disabled={!formState.isValid || !Object.keys(formState.touched).length}
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Anmelden
        </Button>
      </div>
      <div
        style={{
          borderTop: '1px solid',
          borderColor: colors.inputBorder,
          paddingTop: spacing.scale500,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <a
          href={`${config.userPoolDomain}/oauth2/authorize?identity_provider=Google&response_type=code&client_id=${config.userPoolWebClientId}&${config.loginCallbackUrl}`}
          className={styles.googleBtn}
        >
          <div className={styles.googleIconWrapper}>
            <img className={styles.googleIcon} src="/google-logo.svg" />
          </div>
          <b className={styles.btnText}>Mit Google anmelden</b>
        </a>
      </div>
    </AuthForm>
  );
};
