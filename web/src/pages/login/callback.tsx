import React, {useEffect, useState} from 'react';
import {Spinner} from 'components';
import {useAuth, useToaster} from 'context';
import {useRouter} from 'next/router';
import config from 'config';
import {storeSession} from 'services/auth/service';

const Login: React.FC = () => {
  const {refetchUser, currentUser} = useAuth();
  const toaster = useToaster();
  const router = useRouter();
  const {code, error, error_description} = router.query;

  useEffect(() => {
    if (currentUser) router.replace('/dashboard');
  }, [currentUser]);

  const signInUsingAccessCode = (code) => {
    if (!code) return;
    if (code[code.length] === '#') code = code.slice(0, -1);

    const url = config.userPoolDomain + '/oauth2/token';

    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('client_id', config.userPoolWebClientId);
    body.append('code', code);
    body.append('redirect_uri', config.loginCallbackUrl);

    fetch(url, {method: 'POST', headers, body, redirect: 'follow'})
      .then(async (response) => {
        const json = await response.json();
        // Cognito answers 400 {error: 'invalid_grant'} for a reused/expired code — surface it
        // instead of spinning forever (JO-67 QA)
        if (!response.ok || !json.id_token) {
          throw new Error(
            json.error_description || json.error || `Token exchange failed (${response.status})`,
          );
        }
        return json;
      })
      .then(storeSession)
      .then(() => {
        refetchUser();
      })
      .catch((error) => {
        console.error('login callback', error);
        toaster.danger(`Anmeldung fehlgeschlagen: ${error.message}`);
        router.replace('/login');
      });
  };

  useEffect(() => {
    if (!code) return;
    signInUsingAccessCode(code);
  }, [code]);

  useEffect(() => {
    if (!error) return;
    if (!error_description) return;
    // filter error already exists entry after linking providers
    // https://stackoverflow.com/questions/47815161/cognito-auth-flow-fails-with-already-found-an-entry-for-username-facebook-10155
    if (!error_description.toString().startsWith('Already')) {
      // The PreSignUp trigger (infra/lambda/linkProviders) refusing a Google login that was never
      // invited. Cognito wraps its message: "PreSignUp failed with error <message>."
      const message = error_description
        .toString()
        .replace(/^PreSignUp failed with error /, '')
        .replace(/\.\s*$/, '');
      toaster.danger(message);
      router.replace('/login');
      return;
    }
    console.error(error_description);
    console.info('Repeat login');
    const url = `${config.userPoolDomain}/oauth2/authorize?identity_provider=Google&response_type=code&client_id=${config.userPoolWebClientId}&${config.loginCallbackUrl}`;
    router.replace(url);
  }, [error]);

  return (
    <div
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Spinner />
    </div>
  );
};

export default Login;
