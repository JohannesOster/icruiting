import React from 'react';
import {useForm} from 'react-hook-form';
import {Button, Input} from 'components';
import {AuthForm, Typography} from 'components';
import {confirmationCode, password} from 'utils/form-validation';
import {object} from 'yup';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';

export type PasswordFormValues = {
  confirmationCode: string;
  email: string;
  password: string;
};

type Props = {
  onSubmit: (values: PasswordFormValues) => void;
  email: string;
};

export const PasswordForm: React.FC<Props> = ({onSubmit, email}) => {
  const {register, errors, formState, handleSubmit} = useForm<PasswordFormValues>({
    mode: 'onChange',
    resolver: yupResolver(object({confirmationCode, password})),
    criteriaMode: 'all',
  });

  return (
    <AuthForm title="Bestätigenscode" onSubmit={handleSubmit(onSubmit)}>
      <Typography style={{opacity: 0.7}}>
        Wir haben den Bestätigenscode an {email} gesendet.
        <br />
        (Kontrollieren Sie auch den Spam-Ordner)
      </Typography>
      <Input
        autoFocus
        label="Bestätigenscode"
        placeholder="Bestätigenscode"
        type="text"
        name="confirmationCode"
        ref={register}
        errors={errorsFor(errors, 'confirmationCode')}
      />
      <Input
        type="password"
        name="password"
        label="Passwort"
        placeholder="Passwort"
        ref={register}
        errors={errorsFor(errors, 'password')}
      />
      <span style={{margin: '0 auto'}}>
        <Button
          disabled={!formState.isValid || !Object.keys(formState.touched).length}
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Password zurücksetzen
        </Button>
      </span>
    </AuthForm>
  );
};
