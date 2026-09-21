/**
 * Configure a Cognito user pool + app client for passwordless, invite-only login (JO-75):
 *   - pool on the Essentials feature plan (needed for choice-based sign-in),
 *   - e-mail one-time code allowed as a first factor,
 *   - app client: USER_AUTH flow on, password flows off.
 *
 * Usage:  dev (from server/):  npx ts-node src/scripts/configurePool.ts <userPoolId> <clientId> [--apply] [--keep-password-flows]
 *         prod (Heroku dyno):  heroku run -a icruiting-api -- node dist/scripts/configurePool.js <userPoolId> <clientId> --apply
 * --keep-password-flows: run this variant BEFORE the web deploy (adds USER_AUTH next to the old flows),
 * then the plain variant after it (drops the password flows).
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

const [userPoolId, clientId, ...flags] = process.argv.slice(2);
if (!userPoolId || !clientId) {
  console.error(
    'usage: configurePool.ts <userPoolId> <clientId> [--apply] [--keep-password-flows]',
  );
  process.exit(1);
}
const apply = flags.includes('--apply');
// Pre-merge step: enable the new flow next to the old ones so the currently deployed web keeps working.
const keepPasswordFlows = flags.includes('--keep-password-flows');

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
    // The same function serves PreSignUp (link/reject Google logins) and CustomMessage (German code mail).
    LambdaConfig: {
      ...(pool.LambdaConfig || {}),
      CustomMessage: pool.LambdaConfig?.PreSignUp,
    },
    Policies: {
      ...(pool.Policies || {}),
      // PASSWORD cannot be removed at pool level; nothing in the app offers it any more (JO-75).
      SignInPolicy: {AllowedFirstAuthFactors: ['PASSWORD', 'EMAIL_OTP']},
    },
    // Mail goes out through SES (identity + policy from scripts/ses/setupSenderIdentity.ts) — Cognito's
    // own sender is capped at 50 mails/day.
    EmailConfiguration: {
      EmailSendingAccount: 'DEVELOPER',
      SourceArn: 'arn:aws:ses:eu-central-1:278924352912:identity/icruiting.at',
      From: 'icruiting <no-reply@icruiting.at>',
      ReplyToEmailAddress: 'johannes.oster@icruiting.at',
    },
  };
  const poolAfter = {
    tier: poolInput.UserPoolTier,
    firstFactors: poolInput.Policies!.SignInPolicy!.AllowedFirstAuthFactors,
  };

  const wantedFlows: ExplicitAuthFlowsType[] = keepPasswordFlows
    ? (Array.from(
        new Set([
          ...(client.ExplicitAuthFlows || []),
          'ALLOW_USER_AUTH',
          'ALLOW_REFRESH_TOKEN_AUTH',
        ]),
      ) as ExplicitAuthFlowsType[])
    : ['ALLOW_USER_AUTH', 'ALLOW_REFRESH_TOKEN_AUTH'];
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
