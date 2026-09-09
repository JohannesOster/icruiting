import {Auth as AmplifyAuth} from 'aws-amplify';
import {User} from './types';
import API from '../request';

export const Auth = () => {
  const logout = async () => {
    return AmplifyAuth.signOut();
  };

  const login = async (email: string, password: string) => {
    return AmplifyAuth.signIn(email, password);
  };

  const token = async () => {
    return AmplifyAuth.currentSession().then((session) =>
      session.getIdToken().getJwtToken(),
    );
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

  const completeNewPassword = async (user: any, password: string) => {
    return AmplifyAuth.completeNewPassword(user, password);
  };

  const forgotPassword = (email) => {
    return AmplifyAuth.forgotPassword(email);
  };

  const forgotPasswordSubmit = (
    email: string,
    confirmationCode: string,
    password: string,
  ) => {
    return AmplifyAuth.forgotPasswordSubmit(email, confirmationCode, password);
  };

  const connectAccounts = (email: string, sub: string) => {
    return API.post('/members/connect', {body: {email, sub}});
  };

  return {
    login,
    logout,
    token,
    currentUser,
    completeNewPassword,
    forgotPassword,
    forgotPasswordSubmit,
    connectAccounts,
  };
};
