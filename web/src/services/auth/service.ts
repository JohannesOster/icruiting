import {Auth as AmplifyAuth} from 'aws-amplify';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {
  CognitoAccessToken,
  CognitoIdToken,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import config from 'config';
import {User} from './types';

export const NOT_INVITED_MESSAGE =
  'Du wurdest noch nicht eingeladen. Bitte deine:n Administrator:in um eine Einladung.';

export type Tokens = {id_token: string; access_token: string; refresh_token: string};

/** Cognito's client-side SDK for the passwordless USER_AUTH flow (Amplify v3 predates it). */
const cognito = () => new CognitoIdentityProviderClient({region: config.region});

/** Hand tokens obtained outside Amplify (e-mail code, Google callback) to Amplify's session store. */
export const storeSession = ({id_token, access_token, refresh_token}: Tokens) => {
  const userPool = new CognitoUserPool({
    UserPoolId: config.userPoolId,
    ClientId: config.userPoolWebClientId,
  });
  const idToken = new CognitoIdToken({IdToken: id_token});
  const user = new CognitoUser({Pool: userPool, Username: idToken.payload.sub});
  user.setSignInUserSession(
    new CognitoUserSession({
      IdToken: idToken,
      AccessToken: new CognitoAccessToken({AccessToken: access_token}),
      RefreshToken: new CognitoRefreshToken({RefreshToken: refresh_token}),
    }),
  );
};

const translate = (error: any): Error => {
  switch (error?.name) {
    case 'UserNotFoundException':
    case 'NotAuthorizedException':
      return new Error(NOT_INVITED_MESSAGE);
    case 'CodeMismatchException':
      return new Error('Der Code ist nicht korrekt.');
    case 'ExpiredCodeException':
      return new Error('Der Code ist abgelaufen. Bitte fordere einen neuen an.');
    case 'LimitExceededException':
    case 'TooManyRequestsException':
      return new Error('Zu viele Versuche. Bitte warte kurz und versuche es erneut.');
    default:
      return new Error(error?.message || 'Anmeldung fehlgeschlagen.');
  }
};

export const Auth = () => {
  const logout = async () => {
    return AmplifyAuth.signOut();
  };

  /** Step 1 of the e-mail login: Cognito mails a one-time code. Returns the challenge session. */
  const requestCode = async (email: string): Promise<string> => {
    try {
      const res = await cognito().send(
        new InitiateAuthCommand({
          AuthFlow: 'USER_AUTH',
          ClientId: config.userPoolWebClientId,
          AuthParameters: {USERNAME: email, PREFERRED_CHALLENGE: 'EMAIL_OTP'},
        }),
      );
      if (res.ChallengeName !== 'EMAIL_OTP' || !res.Session) {
        throw new Error(`Unerwartete Antwort von Cognito: ${res.ChallengeName}`);
      }
      return res.Session;
    } catch (error) {
      throw translate(error);
    }
  };

  /** Step 2: exchange the code for tokens and open the session. */
  const verifyCode = async (email: string, code: string, session: string): Promise<void> => {
    try {
      const res = await cognito().send(
        new RespondToAuthChallengeCommand({
          ClientId: config.userPoolWebClientId,
          ChallengeName: 'EMAIL_OTP',
          Session: session,
          ChallengeResponses: {USERNAME: email, EMAIL_OTP_CODE: code.trim()},
        }),
      );
      const r = res.AuthenticationResult;
      if (!r?.IdToken || !r.AccessToken || !r.RefreshToken) {
        throw new Error('Anmeldung fehlgeschlagen.');
      }
      storeSession({
        id_token: r.IdToken,
        access_token: r.AccessToken,
        refresh_token: r.RefreshToken,
      });
    } catch (error) {
      throw translate(error);
    }
  };

  const token = async () => {
    return AmplifyAuth.currentSession().then((session) => session.getIdToken().getJwtToken());
  };

  const currentUser = async (): Promise<User> => {
    const userInfo = await AmplifyAuth.currentUserInfo();
    return {
      userId: userInfo.attributes.sub,
      email: userInfo.attributes.email,
      givenName: userInfo.attributes.given_name,
      familyName: userInfo.attributes.family_name,
      preferredName: userInfo.attributes.preferred_username,
      tenantId: userInfo.attributes['custom:tenant_id'],
      userRole: userInfo.attributes['custom:user_role'],
      token: await token(),
    };
  };

  return {logout, requestCode, verifyCode, token, currentUser};
};
