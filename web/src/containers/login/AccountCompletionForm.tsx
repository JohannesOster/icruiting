import React from 'react';
import {Button, Input} from 'components';
import {AuthForm} from 'components';
import {useForm} from 'react-hook-form';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';
import {password} from 'utils/form-validation';
import {object} from 'yup';

export type AccountCompletionValues = {
  password: string;
};

type Props = {
  onSubmit: (values: AccountCompletionValues) => void;
};

export const AccountCompletionForm: React.FC<Props> = ({onSubmit}) => {
  const {register, errors, formState, handleSubmit} = useForm<AccountCompletionValues>({
    mode: 'onChange',
    criteriaMode: 'all',
    resolver: yupResolver(object({password})),
  });

  return (
    <AuthForm title="Neues Passwort erstellen" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Passwort"
        placeholder="Passwort"
        type="password"
        name="password"
        ref={register}
        errors={errorsFor(errors, 'password')}
        required
      />
      <div style={{marginLeft: 'auto'}}>
        <Button
          disabled={!formState.isValid || !Object.keys(formState.touched).length}
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Bestätigen
        </Button>
      </div>
    </AuthForm>
  );
};
