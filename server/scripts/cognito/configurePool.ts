/**
 * Configure a Cognito user pool + app client for passwordless, invite-only login (JO-75):
 *   - pool on the Essentials feature plan (needed for choice-based sign-in),
 *   - e-mail one-time code allowed as a first factor,
 *   - app client: USER_AUTH flow on, password flows off.
 *
 * Usage (from server/):  yarn ts-node scripts/cognito/configurePool.ts <userPoolId> <clientId> [--apply]
 * Without --apply it only prints what would change. Credentials/region come from the environment
 * (AWS_REGION, AWS_ACCESS_KEY_ID, …) — for prod run it on a Heroku dyno.
 *
 * UpdateUserPool / UpdateUserPoolClient are "replace" APIs: anything not passed is reset to its
 * default, so both are fed the full current configuration with only the intended fields changed.
 */
import {
  CognitoIdentityProvider,
  UpdateUserPoolCommandInput,
  UpdateUserPoolClientCommandInput,
  ExplicitAuthFlowsType,
} from '@aws-sdk/client-cognito-identity-provider';

const [userPoolId, clientId, flag] = process.argv.slice(2);
if (!userPoolId || !clientId) {
  console.error('usage: configurePool.ts <userPoolId> <clientId> [--apply]');
  process.exit(1);
}
const apply = flag === '--apply';

const POOL_MUTABLE: (keyof UpdateUserPoolCommandInput)[] = [
  'Policies',
  'DeletionProtection',
  'LambdaConfig',
  'AutoVerifiedAttributes',
  'SmsVerificationMessage',
  'EmailVerificationMessage',
  'EmailVerificationSubject',
  'VerificationMessageTemplate',
  'SmsAuthenticationMessage',
  'UserAttributeUpdateSettings',
  'MfaConfiguration',
  'DeviceConfiguration',
  'EmailConfiguration',
  'SmsConfiguration',
  'UserPoolTags',
  'AdminCreateUserConfig',
  'UserPoolAddOns',
  'AccountRecoverySetting',
  'PoolName',
  'UserPoolTier',
];
const CLIENT_MUTABLE: (keyof UpdateUserPoolClientCommandInput)[] = [
  'ClientName',
  'RefreshTokenValidity',
  'AccessTokenValidity',
  'IdTokenValidity',
  'TokenValidityUnits',
  'ReadAttributes',
  'WriteAttributes',
  'ExplicitAuthFlows',
  'SupportedIdentityProviders',
  'CallbackURLs',
  'LogoutURLs',
  'DefaultRedirectURI',
  'AllowedOAuthFlows',
  'AllowedOAuthScopes',
  'AllowedOAuthFlowsUserPoolClient',
  'AnalyticsConfiguration',
  'PreventUserExistenceErrors',
  'EnableTokenRevocation',
  'EnablePropagateAdditionalUserContextData',
  'AuthSessionValidity',
  'RefreshTokenRotation',
];
const pick = <T extends object>(obj: any, keys: (keyof T)[]): Partial<T> =>
  Object.fromEntries(
    keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]),
  ) as Partial<T>;

(async () => {
  const c = new CognitoIdentityProvider({});
  const pool = (await c.describeUserPool({UserPoolId: userPoolId})).UserPool!;
  const client = (await c.describeUserPoolClient({UserPoolId: userPoolId, ClientId: clientId}))
    .UserPoolClient!;

  const poolBefore = {
    tier: pool.UserPoolTier,
    firstFactors: pool.Policies?.SignInPolicy?.AllowedFirstAuthFactors,
  };
  const poolInput: UpdateUserPoolCommandInput = {
    UserPoolId: userPoolId,
    ...pick<UpdateUserPoolCommandInput>(pool, POOL_MUTABLE),
    UserPoolTier: 'ESSENTIALS',
    Policies: {
      ...(pool.Policies || {}),
      // PASSWORD cannot be removed at pool level; nothing in the app offers it any more (JO-75).
      SignInPolicy: {AllowedFirstAuthFactors: ['PASSWORD', 'EMAIL_OTP']},
    },
  };
  const poolAfter = {
    tier: poolInput.UserPoolTier,
    firstFactors: poolInput.Policies!.SignInPolicy!.AllowedFirstAuthFactors,
  };

  const wantedFlows: ExplicitAuthFlowsType[] = ['ALLOW_USER_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'];
  const clientInput: UpdateUserPoolClientCommandInput = {
    UserPoolId: userPoolId,
    ClientId: clientId,
    ...pick<UpdateUserPoolClientCommandInput>(client, CLIENT_MUTABLE),
    ExplicitAuthFlows: wantedFlows,
    // LEGACY = Cognito answers UserNotFoundException for unknown addresses. Invite-only tool: the
    // login page turns that into "Du wurdest noch nicht eingeladen" (JO-75).
    PreventUserExistenceErrors: 'LEGACY',
  };

  console.log('pool   ', JSON.stringify(poolBefore), '→', JSON.stringify(poolAfter));
  console.log(
    'client ',
    JSON.stringify(client.ExplicitAuthFlows),
    '→',
    JSON.stringify(wantedFlows),
  );
  console.log('client PreventUserExistenceErrors', client.PreventUserExistenceErrors, '→ LEGACY');
  if (!apply) return console.log('dry run — add --apply to write');

  await c.updateUserPool(poolInput);
  await c.updateUserPoolClient(clientInput);
  const p2 = (await c.describeUserPool({UserPoolId: userPoolId})).UserPool!;
  const c2 = (await c.describeUserPoolClient({UserPoolId: userPoolId, ClientId: clientId}))
    .UserPoolClient!;
  console.log(
    'applied:',
    JSON.stringify({
      tier: p2.UserPoolTier,
      firstFactors: p2.Policies?.SignInPolicy?.AllowedFirstAuthFactors,
      flows: c2.ExplicitAuthFlows,
    }),
  );
})().catch((e) => {
  console.error(e.name, e.message);
  process.exit(1);
});
