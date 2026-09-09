import React from 'react';
import {email} from 'utils/form-validation';
import {object} from 'yup';
import {useForm} from 'react-hook-form';
import {Button, Input} from 'components';
import {AuthForm} from 'components';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';

type EmailFormValues = {
  email: string;
};

type Props = {
  onSubmit: (values: EmailFormValues) => void;
};

export const EmailForm: React.FC<Props> = ({onSubmit}) => {
  const {register, errors, formState, handleSubmit} = useForm<EmailFormValues>({
    mode: 'onChange',
    resolver: yupResolver(object({email})),
    criteriaMode: 'all',
  });

  return (
    <AuthForm title="Password Reset" onSubmit={handleSubmit(onSubmit)}>
      <Input
        autoFocus
        label="E-Mail-Adresse"
        placeholder="E-Mail-Adresse"
        type="email"
        name="email"
        ref={register}
        errors={errorsFor(errors, 'email')}
      />
      <span style={{margin: '0 auto'}}>
        <Button
          disabled={
            !formState.isValid || !Object.keys(formState.touched).length
          }
          isLoading={formState.isSubmitting}
          type="submit"
        >
          Code Senden
        </Button>
      </span>
    </AuthForm>
  );
};
