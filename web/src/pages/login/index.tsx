import React, {useEffect, useState} from 'react';
import {CodeForm, CodeFormValues, EmailForm, EmailFormValues} from 'containers';
import {useAuth, useToaster} from 'context';
import {useRouter} from 'next/router';
import {API} from 'services';

/**
 * Passwordless login (JO-75): e-mail → one-time code → session. Google lives in the EmailForm.
 * Only invited addresses exist in the user pool, so an unknown address gets the "not invited" hint.
 */
const Login: React.FC = () => {
  const {refetchUser, currentUser} = useAuth();
  const toaster = useToaster();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) router.replace('/dashboard');
  }, [currentUser]);

  const requestCode = async (address: string) => {
    try {
      const nextSession = await API.auth.requestCode(address);
      setEmail(address);
      setSession(nextSession);
    } catch (error) {
      toaster.danger(error.message);
    }
  };

  const handleEmail = ({email: address}: EmailFormValues) => requestCode(address.trim());

  const handleCode = async ({confirmationCode}: CodeFormValues) => {
    if (!email || !session) return;
    try {
      await API.auth.verifyCode(email, confirmationCode, session);
      await refetchUser();
    } catch (error) {
      toaster.danger(error.message);
    }
  };

  if (email && session) {
    return (
      <CodeForm
        email={email}
        onSubmit={handleCode}
        onResend={() => requestCode(email).then(() => toaster.success('Neuer Code gesendet.'))}
        onChangeEmail={() => {
          setEmail(null);
          setSession(null);
        }}
      />
    );
  }
  return <EmailForm onSubmit={handleEmail} />;
};

export default Login;
