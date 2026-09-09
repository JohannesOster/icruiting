import React, {useEffect, useState} from 'react';
import {
  LoginFormValues,
  AccountCompletionValues,
  AccountCompletionForm,
  LoginForm,
} from 'containers';
import {useAuth, useToaster} from 'context';
import {useRouter} from 'next/router';
import {API} from 'services';

const Login: React.FC = () => {
  const {refetchUser, currentUser} = useAuth();
  const toaster = useToaster();
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginFormValues | null>(null);

  useEffect(() => {
    if (currentUser) router.replace('/dashboard');
  }, [currentUser]);

  const handleLoginFormSubmit = async ({email, password}: LoginFormValues) => {
    await API.auth
      .login(email, password)
      .then((user) => {
        // if admin creates new user he has to reset his password
        if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
          /* save credentials for later since account completion submit
           * has to re-sign in user */
          setCredentials({email, password});
          return;
        }
        // if it isn't a new user go on to landingpage
        refetchUser();
      })
      .catch((error) => {
        toaster.danger(error.message);
      });
  };

  const handleAccountCompletionFormSubmit = async ({
    password: newPassword,
  }: AccountCompletionValues) => {
    if (!credentials?.email || !credentials.password) return;
    await API.auth
      .login(credentials?.email, credentials?.password)
      .then(async (user) => {
        await API.auth.completeNewPassword(user, newPassword).then(refetchUser);
      })
      .catch((err) => {
        toaster.danger(err.message);
      });
  };

  return credentials ? (
    <AccountCompletionForm onSubmit={handleAccountCompletionFormSubmit} />
  ) : (
    <LoginForm onSubmit={handleLoginFormSubmit} />
  );
};

export default Login;
