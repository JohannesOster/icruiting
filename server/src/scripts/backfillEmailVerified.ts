/**
 * One-off (JO-75): make every invited (native) user able to log in passwordless —
 *   - e-mail marked verified (invites never set it; Cognito refuses federated logins and e-mail
 *     codes for unverified addresses),
 *   - pending invites (FORCE_CHANGE_PASSWORD, temporary password never used) confirmed with a random
 *     permanent password, like new invites.
 *
 * Usage:  dev (from server/):  npx ts-node src/scripts/backfillEmailVerified.ts <userPoolId> [--apply]
 *         prod (Heroku dyno):  heroku run -a icruiting-api -- node dist/src/scripts/backfillEmailVerified.js <userPoolId> --apply
 * Prints counts only (no e-mail addresses). For prod run it on a Heroku dyno.
 */
import {CognitoIdentityProvider, UserType} from '@aws-sdk/client-cognito-identity-provider';
import {randomBytes} from 'crypto';

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

  const native = users.filter((u) => u.UserStatus !== 'EXTERNAL_PROVIDER' && attr(u, 'email'));
  const unverified = native.filter((u) => attr(u, 'email_verified') !== 'true');
  const pending = native.filter((u) => u.UserStatus === 'FORCE_CHANGE_PASSWORD');
  console.log(
    `users=${users.length} native=${native.length} unverified=${unverified.length} pending=${pending.length}` +
      (apply ? '' : ' (dry run)'),
  );
  if (!apply) return;

  for (const u of unverified) {
    await c.adminUpdateUserAttributes({
      UserPoolId: userPoolId,
      Username: u.Username!,
      UserAttributes: [{Name: 'email_verified', Value: 'true'}],
    });
  }
  for (const u of pending) {
    await c.adminSetUserPassword({
      UserPoolId: userPoolId,
      Username: u.Username!,
      Password: randomBytes(24).toString('base64url') + 'aA1!',
      Permanent: true,
    });
  }
  console.log(`verified=${unverified.length} confirmed=${pending.length}`);
})().catch((e) => {
  console.error(e.name, e.message);
  process.exit(1);
});
