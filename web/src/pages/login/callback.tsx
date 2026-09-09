import React, {useEffect, useState} from 'react';
import {Spinner} from 'components';
import {useAuth} from 'context';
import {useRouter} from 'next/router';
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import config from 'config';

const Login: React.FC = () => {
  const {refetchUser, currentUser} = useAuth();
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
      .then((response) => response.json())
      .then(({id_token, access_token, refresh_token}) => {
        const userPool = new CognitoUserPool({
          UserPoolId: config.userPoolId,
          ClientId: config.userPoolWebClientId,
        });

        const cognitoIdToken = new CognitoIdToken({
          IdToken: id_token,
        });
        const cognitoAccessToken = new CognitoAccessToken({
          AccessToken: access_token,
        });
        const cognitoRefreshToken = new CognitoRefreshToken({
          RefreshToken: refresh_token,
        });

        const username = cognitoIdToken.payload.sub;
        const user = new CognitoUser({Pool: userPool, Username: username});
        user.setSignInUserSession(
          new CognitoUserSession({
            AccessToken: cognitoAccessToken,
            IdToken: cognitoIdToken,
            RefreshToken: cognitoRefreshToken,
          }),
        );
      })
      .then(() => {
        refetchUser();
      })
      .catch((error) => console.log('error', error));
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
    if (!error_description.toString().startsWith('Already')) return;
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
