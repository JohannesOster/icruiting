/**
 * One-off (JO-75): mark the e-mail of every invited (native) user as verified. Invites never set
 * `email_verified`, and Cognito refuses both federated logins and e-mail codes for unverified
 * addresses. An invited address is trusted by definition.
 *
 * Usage (from server/):  yarn ts-node scripts/cognito/backfillEmailVerified.ts <userPoolId> [--apply]
 * Prints counts only (no e-mail addresses). For prod run it on a Heroku dyno.
 */
import {CognitoIdentityProvider, UserType} from '@aws-sdk/client-cognito-identity-provider';

const [userPoolId, flag] = process.argv.slice(2);
if (!userPoolId) {
  console.error('usage: backfillEmailVerified.ts <userPoolId> [--apply]');
  process.exit(1);
}
const apply = flag === '--apply';
const attr = (u: UserType, n: string) => u.Attributes?.find((a) => a.Name === n)?.Value;

(async () => {
  const c = new CognitoIdentityProvider({});
  const users: UserType[] = [];
  let PaginationToken: string | undefined;
  do {
    const r = await c.listUsers({UserPoolId: userPoolId, PaginationToken, Limit: 60});
    users.push(...(r.Users || []));
    PaginationToken = r.PaginationToken;
  } while (PaginationToken);

  const todo = users.filter(
    (u) =>
      u.UserStatus !== 'EXTERNAL_PROVIDER' &&
      attr(u, 'email') &&
      attr(u, 'email_verified') !== 'true',
  );
  console.log(
    `users=${users.length} unverified native users=${todo.length}` + (apply ? '' : ' (dry run)'),
  );
  if (!apply) return;

  let ok = 0;
  for (const u of todo) {
    await c.adminUpdateUserAttributes({
      UserPoolId: userPoolId,
      Username: u.Username!,
      UserAttributes: [{Name: 'email_verified', Value: 'true'}],
    });
    ok++;
  }
  console.log(`updated=${ok}`);
})().catch((e) => {
  console.error(e.name, e.message);
  process.exit(1);
});
