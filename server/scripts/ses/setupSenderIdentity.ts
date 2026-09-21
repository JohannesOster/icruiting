/**
 * SES sender identity for Cognito mails (JO-75). Creates/reads the domain identity for icruiting.at
 * with Easy DKIM, prints the DKIM CNAME records to add at the DNS host, and attaches the identity
 * policy that lets both Cognito user pools send through it.
 *
 * Usage (from server/, icruiting-dev key in the env):  npx ts-node scripts/ses/setupSenderIdentity.ts
 * Idempotent. Leaving the SES sandbox is a console action (owner).
 */
import {
  SESv2Client,
  CreateEmailIdentityCommand,
  GetEmailIdentityCommand,
  CreateEmailIdentityPolicyCommand,
  UpdateEmailIdentityPolicyCommand,
  GetAccountCommand,
} from '@aws-sdk/client-sesv2';

const REGION = 'eu-central-1';
const ACCOUNT = '278924352912';
const DOMAIN = 'icruiting.at';
const POOLS = ['eu-central-1_MeIKYtqcU', 'eu-central-1_WK7ijcvLY'];

(async () => {
  const ses = new SESv2Client({region: REGION});
  const account = await ses.send(new GetAccountCommand({}));
  console.log(
    `SES account: production=${account.ProductionAccessEnabled} quota/24h=${account.SendQuota?.Max24HourSend}`,
  );

  let identity;
  try {
    identity = await ses.send(new GetEmailIdentityCommand({EmailIdentity: DOMAIN}));
    console.log(`identity ${DOMAIN} exists: verified=${identity.VerifiedForSendingStatus}`);
  } catch (e: any) {
    if (e.name !== 'NotFoundException') throw e;
    await ses.send(new CreateEmailIdentityCommand({EmailIdentity: DOMAIN}));
    identity = await ses.send(new GetEmailIdentityCommand({EmailIdentity: DOMAIN}));
    console.log(`identity ${DOMAIN} created`);
  }

  console.log('DKIM CNAME records to add at the DNS host (GoDaddy):');
  for (const token of identity.DkimAttributes?.Tokens || []) {
    console.log(`  ${token}._domainkey.${DOMAIN}  CNAME  ${token}.dkim.amazonses.com`);
  }
  console.log(`DKIM status: ${identity.DkimAttributes?.Status}`);

  const identityArn = `arn:aws:ses:${REGION}:${ACCOUNT}:identity/${DOMAIN}`;
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowCognitoUserPools',
        Effect: 'Allow',
        Principal: {Service: 'cognito-idp.amazonaws.com'},
        Action: ['ses:SendEmail', 'ses:SendRawEmail'],
        Resource: identityArn,
        Condition: {
          StringEquals: {'aws:SourceAccount': ACCOUNT},
          ArnLike: {
            'aws:SourceArn': POOLS.map(
              (p) => `arn:aws:cognito-idp:${REGION}:${ACCOUNT}:userpool/${p}`,
            ),
          },
        },
      },
    ],
  };
  const policyInput = {
    EmailIdentity: DOMAIN,
    PolicyName: 'cognito-user-pools',
    Policy: JSON.stringify(policy),
  };
  try {
    await ses.send(new CreateEmailIdentityPolicyCommand(policyInput));
  } catch (e: any) {
    if (e.name !== 'AlreadyExistsException') throw e;
    await ses.send(new UpdateEmailIdentityPolicyCommand(policyInput));
  }
  console.log('identity policy "cognito-user-pools" set for', POOLS.join(', '));
  console.log(
    `\nCognito EmailConfiguration once DKIM is verified and the sandbox is left:\n  {EmailSendingAccount: 'DEVELOPER', SourceArn: '${identityArn}', From: 'icruiting <no-reply@${DOMAIN}>', ReplyToEmailAddress: 'johannes.oster@${DOMAIN}'}`,
  );
})().catch((e) => {
  console.error(e.name, e.message);
  process.exit(1);
});
