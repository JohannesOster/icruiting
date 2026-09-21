import {BaseError} from 'application';
import {CognitoIdentityProvider} from '@aws-sdk/client-cognito-identity-provider';
import CognitoExpress from 'cognito-express';
import {randomBytes} from 'crypto';
import {mapCognitoUser, removePrefix} from './utils';
import config from 'config';

export const AuthService = () => {
  const cognitoUserPoolId = config.get('awsCognito.userPoolId');
  const clientId = config.get('awsCognito.clientId');
  const region = config.get('awsCognito.region');

  if (!(cognitoUserPoolId && clientId && region)) {
    throw new Error('Missing required aws credentials!');
  }

  const cognitoExpress = new CognitoExpress({
    region,
    cognitoUserPoolId,
    tokenUse: 'id',
    tokenExpiration: 3600000,
  });

  const validateToken = (token: string): Promise<User> => {
    return new Promise((resolve, reject) => {
      cognitoExpress.validate(token, (err: Error, payload: any) => {
        if (err) reject(new BaseError(401, err.message));
        resolve({
          tenantId: payload['custom:tenant_id'],
          userId: payload.sub,
          userRole: payload['custom:user_role'],
          email: payload.email,
        });
      });
    });
  };

  type createUserProps = {
    email: string;
    tenantId: string;
    userRole: 'member' | 'admin';
  };
  /**
   * Invite: creates the user ready to log in passwordless (JO-75) — e-mail verified, CONFIRMED via a
   * random permanent password nobody knows, no Cognito invitation mail (the caller sends ours).
   */
  const createUser = async (user: createUserProps) => {
    const cIdp = new CognitoIdentityProvider();
    const created = await cIdp.adminCreateUser({
      UserPoolId: cognitoUserPoolId,
      Username: user.email,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        {Name: 'email', Value: user.email},
        {Name: 'email_verified', Value: 'true'},
        {Name: 'custom:tenant_id', Value: user.tenantId},
        {Name: 'custom:user_role', Value: user.userRole},
      ],
    });
    await cIdp.adminSetUserPassword({
      UserPoolId: cognitoUserPoolId,
      Username: user.email,
      Password: randomBytes(24).toString('base64url') + 'aA1!',
      Permanent: true,
    });
    return created;
  };
  const listUsers = (tenantId: string): Promise<{[key: string]: string}[]> => {
    const cIdp = new CognitoIdentityProvider();
    return new Promise(async (resolve) => {
      const params = {
        UserPoolId: cognitoUserPoolId,
        AttributesToGet: [
          'sub',
          'email',
          'custom:user_role',
          'custom:tenant_id',
          'cognito:user_status',
        ],
        Limit: 60,
      };

      const filterConfirmed = {Filter: 'cognito:user_status = "CONFIRMED"'};
      const filterPending = {Filter: 'cognito:user_status = "FORCE_CHANGE_PASSWORD"'};

      let {Users: confirmed = [], PaginationToken: cPToken} = await cIdp.listUsers({
        ...params,
        ...filterConfirmed,
      });
      let {Users: pending = [], PaginationToken: pPToken} = await cIdp.listUsers({
        ...params,
        ...filterPending,
      });

      while (cPToken || pPToken) {
        if (cPToken) {
          const {Users: cUsers = [], PaginationToken: _cPToken} = await cIdp.listUsers({
            ...params,
            ...filterConfirmed,
            PaginationToken: cPToken,
          });
          confirmed = confirmed.concat(cUsers);
          cPToken = _cPToken;
        }

        if (pPToken) {
          const {Users: pUsers = [], PaginationToken: _pPToken} = await cIdp.listUsers({
            ...params,
            ...filterPending,
            PaginationToken: pPToken,
          });
          pending = pending.concat(pUsers);
          pPToken = _pPToken;
        }
      }

      const Users = confirmed.concat(pending);

      if (!Users.length) return resolve([]);

      const keyModifier = (key: string) => removePrefix(key, 'custom:');
      const userMaps = Users.map((user) => mapCognitoUser(user, keyModifier));

      // filter out foreign tenants
      const filtered = userMaps?.filter((user) => user.tenant_id === tenantId);

      resolve(filtered);
    });
  };

  type UpdateUserRoleParams = {userRole: string; email: string};
  const updateUserRole = ({userRole, email}: UpdateUserRoleParams) => {
    const cIdp = new CognitoIdentityProvider();
    const params = {
      UserPoolId: cognitoUserPoolId,
      Username: email,
      UserAttributes: [{Name: 'custom:user_role', Value: userRole}],
    };
    return cIdp.adminUpdateUserAttributes(params);
  };

  const deleteUser = (email: string) => {
    const cIdp = new CognitoIdentityProvider();
    const params = {UserPoolId: cognitoUserPoolId, Username: email};
    return cIdp.adminDeleteUser(params);
  };

  const retrieve = (email: string) => {
    const cIdp = new CognitoIdentityProvider();
    const params = {UserPoolId: cognitoUserPoolId, Username: email};
    return cIdp.adminGetUser(params);
  };

  return {
    validateToken,
    createUser,
    listUsers,
    retrieve,
    deleteUser,
    updateUserRole,
  };
};
