/**
 * Deploy infra/lambda/linkProviders to the `linkProviders` Cognito trigger (JO-75).
 * Runs the Lambda's unit tests first, zips index.mjs, moves the function to nodejs22.x if needed,
 * uploads the code and publishes a numbered version (for rollback: `aws lambda update-alias` or
 * re-deploy an older commit).
 *
 * Usage (from server/):  yarn lambda:deploy        (AWS credentials from the environment)
 */
import {execSync} from 'child_process';
import {readFileSync} from 'fs';
import {join} from 'path';
import {
  LambdaClient,
  GetFunctionConfigurationCommand,
  UpdateFunctionConfigurationCommand,
  UpdateFunctionCodeCommand,
  PublishVersionCommand,
  waitUntilFunctionUpdated,
} from '@aws-sdk/client-lambda';
import AdmZip from 'adm-zip';

const FunctionName = 'linkProviders';
const RUNTIME = 'nodejs22.x';
const dir = join(__dirname, '..', '..', '..', 'infra', 'lambda', 'linkProviders');

(async () => {
  execSync('node --test', {cwd: dir, stdio: 'inherit'});
  const zip = new AdmZip();
  zip.addFile('index.mjs', readFileSync(join(dir, 'index.mjs')));
  const ZipFile = zip.toBuffer();

  const lambda = new LambdaClient({region: 'eu-central-1'});
  const cfg = await lambda.send(new GetFunctionConfigurationCommand({FunctionName}));
  console.log(
    `current: runtime=${cfg.Runtime} handler=${cfg.Handler} modified=${cfg.LastModified}`,
  );
  if (cfg.Runtime !== RUNTIME || cfg.Handler !== 'index.handler') {
    await lambda.send(
      new UpdateFunctionConfigurationCommand({
        FunctionName,
        Runtime: RUNTIME,
        Handler: 'index.handler',
      }),
    );
    await waitUntilFunctionUpdated({client: lambda, maxWaitTime: 120}, {FunctionName});
    console.log(`runtime set to ${RUNTIME}`);
  }
  await lambda.send(new UpdateFunctionCodeCommand({FunctionName, ZipFile}));
  await waitUntilFunctionUpdated({client: lambda, maxWaitTime: 120}, {FunctionName});
  const sha = execSync('git rev-parse --short HEAD').toString().trim();
  const v = await lambda.send(
    new PublishVersionCommand({FunctionName, Description: `icruiting@${sha}`}),
  );
  console.log(`deployed ${FunctionName} version ${v.Version} (${v.Description})`);
})().catch((e) => {
  console.error(e.name, e.message);
  process.exit(1);
});
