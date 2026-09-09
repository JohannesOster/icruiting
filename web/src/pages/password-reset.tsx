import React, {useState, useRef} from 'react';
import {useRouter} from 'next/router';
import {EmailForm, PasswordForm, PasswordFormValues} from 'containers';
import {useTheme} from 'styled-components';
import {useToaster} from 'context';
import {API} from 'services';

const PasswordReset: React.FC = () => {
  const router = useRouter();
  const toaster = useToaster();
  const [sentCode, setSentCode] = useState<boolean>(false);
  const email = useRef<string>('');
  const {spacing} = useTheme();

  const submitMailForm = async (values: {email: string}) => {
    await API.auth
      .forgotPassword(values.email)
      .then(() => {
        email.current = values.email;
        setSentCode(true);
      })
      .catch((err) => {
        toaster.danger(err.message);
      });
  };

  const submitCodeForm = async ({confirmationCode, password}: PasswordFormValues) => {
    await API.auth
      .forgotPasswordSubmit(email.current, confirmationCode, password)
      .then(() => {
        toaster.success('Password erfolgreich geändert!');
        router.back();
      })
      .catch((error) => {
        toaster.danger(error.message);
      });
  };

  return !sentCode ? (
    <EmailForm onSubmit={submitMailForm} />
  ) : (
    <PasswordForm onSubmit={submitCodeForm} email={email.current} />
  );
};

export default PasswordReset;
