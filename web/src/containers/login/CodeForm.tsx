import React from 'react';
import {useForm} from 'react-hook-form';
import {AuthForm, Button, Input, Typography} from 'components';
import {confirmationCode} from 'utils/form-validation';
import {object} from 'yup';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';
import {useTheme} from 'styled-components';

export type CodeFormValues = {confirmationCode: string};

type Props = {
  email: string;
  onSubmit: (values: CodeFormValues) => void;
  onResend: () => void;
  onChangeEmail: () => void;
};

/** Step 2 of the passwordless login: the one-time code from the e-mail. */
export const CodeForm: React.FC<Props> = ({email, onSubmit, onResend, onChangeEmail}) => {
  const {spacing} = useTheme();
  const {register, errors, formState, handleSubmit} = useForm<CodeFormValues>({
    mode: 'onChange',
    resolver: yupResolver(object({confirmationCode})),
    criteriaMode: 'all',
  });

  return (
    <AuthForm title="Anmeldecode" onSubmit={handleSubmit(onSubmit)}>
      <Typography kind="secondary">
        Wir haben einen Anmeldecode an <b>{email}</b> geschickt. Er ist ein paar Minuten gültig –
        bitte auch den Spam-Ordner prüfen.
      </Typography>
      <Input
        autoFocus
        label="Anmeldecode"
        placeholder="6-stelliger Code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        name="confirmationCode"
        ref={register}
        errors={errorsFor(errors, 'confirmationCode')}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: spacing.scale200,
        }}
      >
        <Typography kind="secondary">
          <a href="#" onClick={(e) => (e.preventDefault(), onResend())}>
            Code erneut senden
          </a>
          {' · '}
          <a href="#" onClick={(e) => (e.preventDefault(), onChangeEmail())}>
            Andere E-Mail-Adresse
          </a>
        </Typography>
        <Button
          disabled={!formState.isValid || !Object.keys(formState.touched).length}
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Anmelden
        </Button>
      </div>
    </AuthForm>
  );
};
