// Cognito PreSignUp trigger `linkProviders` (shared by the dev and prod user pools).
//
// Sign-up in icruiting is invite-only. When someone signs in with Google, Cognito calls this
// trigger before it would create a federated user:
//   - an invited (native) user with the same e-mail exists → link the Google identity to it, so the
//     login ends up in the invited account with its tenant and role;
//   - no such user → throw. Cognito aborts the sign-up, creates nothing, and sends the browser back
//     to the login callback with the message below as `error_description`.
//
// Runtime: nodejs22.x (AWS SDK v3 is provided by the runtime, no bundling needed).
// Deploy: `yarn lambda:deploy` in server/ (see scripts/lambda/deployLinkProviders.ts).
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import {randomBytes} from 'node:crypto';

export const NOT_INVITED_MESSAGE =
  'Du wurdest noch nicht eingeladen. Bitte deine:n Administrator:in um eine Einladung.';

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

/** Federated usernames look like `google_1234567890` → {providerName: 'Google', providerUserId: '1234567890'} */
export const parseFederatedUsername = (userName) => {
  const idx = userName.indexOf('_');
  if (idx < 1) throw new Error(`Unexpected federated username: ${userName}`);
  return {providerName: capitalize(userName.slice(0, idx)), providerUserId: userName.slice(idx + 1)};
};

/** Pick the invited account to link to: a native user (never EXTERNAL_PROVIDER) with that e-mail. */
export const findInvitedUser = (users = []) =>
  users.find((u) => u.UserStatus !== 'EXTERNAL_PROVIDER' && u.UserStatus !== 'UNCONFIRMED');

const permanentPassword = () => randomBytes(24).toString('base64url') + 'aA1!';

export const makeHandler = (client) => async (event) => {
  if (!event.triggerSource?.includes('ExternalProvider')) return event;
  const email = event.request?.userAttributes?.email;
  if (!email) throw new Error(NOT_INVITED_MESSAGE);

  const {Users} = await client.send(
    new ListUsersCommand({
      UserPoolId: event.userPoolId,
      AttributesToGet: ['email', 'email_verified'],
      Filter: `email = "${email.replace(/"/g, '')}"`,
    }),
  );
  const invited = findInvitedUser(Users);
  if (!invited) {
    console.log(`linkProviders: no invited user for ${email} — rejecting sign-up`);
    throw new Error(NOT_INVITED_MESSAGE);
  }

  const {providerName, providerUserId} = parseFederatedUsername(event.userName);
  const base = {UserPoolId: event.userPoolId, Username: invited.Username};

  // Cognito refuses a federated login into a user that is not CONFIRMED with a verified e-mail.
  if (invited.UserStatus === 'FORCE_CHANGE_PASSWORD') {
    await client.send(new AdminSetUserPasswordCommand({...base, Password: permanentPassword(), Permanent: true}));
  }
  const verified = invited.Attributes?.find((a) => a.Name === 'email_verified')?.Value === 'true';
  if (!verified) {
    await client.send(
      new AdminUpdateUserAttributesCommand({...base, UserAttributes: [{Name: 'email_verified', Value: 'true'}]}),
    );
  }

  await client.send(
    new AdminLinkProviderForUserCommand({
      UserPoolId: event.userPoolId,
      DestinationUser: {ProviderName: 'Cognito', ProviderAttributeValue: invited.Username},
      SourceUser: {ProviderName: providerName, ProviderAttributeName: 'Cognito_Subject', ProviderAttributeValue: providerUserId},
    }),
  );
  console.log(`linkProviders: linked ${providerName} identity to ${invited.Username}`);
  // Cognito now fails this very sign-in with "Already found an entry for username …" — the web
  // callback repeats the login once, which then succeeds against the linked user.
  return event;
};

export const handler = makeHandler(new CognitoIdentityProviderClient({}));
