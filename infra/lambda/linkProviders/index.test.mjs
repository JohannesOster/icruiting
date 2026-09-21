import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeHandler, NOT_INVITED_MESSAGE, parseFederatedUsername, findInvitedUser, codeMessage} from './index.mjs';

const event = (over = {}) => ({
  triggerSource: 'PreSignUp_ExternalProvider',
  userPoolId: 'eu-central-1_test',
  userName: 'google_111222333',
  request: {userAttributes: {email: 'invited@example.com'}},
  ...over,
});
const fakeClient = (users) => {
  const calls = [];
  return {
    calls,
    send: async (cmd) => {
      calls.push(cmd.constructor.name);
      if (cmd.constructor.name === 'ListUsersCommand') return {Users: users};
      return {};
    },
  };
};

test('non-federated sign-ups pass through untouched', async () => {
  const c = fakeClient([]);
  const e = event({triggerSource: 'PreSignUp_AdminCreateUser'});
  assert.equal(await makeHandler(c)(e), e);
  assert.deepEqual(c.calls, []);
});

test('rejects a Google sign-up with no invited user', async () => {
  const c = fakeClient([]);
  await assert.rejects(makeHandler(c)(event()), {message: NOT_INVITED_MESSAGE});
  assert.deepEqual(c.calls, ['ListUsersCommand']);
});

test('an orphan federated user with the same e-mail does not count as an invite', async () => {
  const c = fakeClient([{Username: 'google_9', UserStatus: 'EXTERNAL_PROVIDER', Attributes: []}]);
  await assert.rejects(makeHandler(c)(event()), {message: NOT_INVITED_MESSAGE});
});

test('links to a confirmed, verified invited user without touching password or attributes', async () => {
  const c = fakeClient([{Username: 'u-1', UserStatus: 'CONFIRMED', Attributes: [{Name: 'email_verified', Value: 'true'}]}]);
  await makeHandler(c)(event());
  assert.deepEqual(c.calls, ['ListUsersCommand', 'AdminLinkProviderForUserCommand']);
});

test('confirms and verifies a pending invite before linking', async () => {
  const c = fakeClient([{Username: 'u-2', UserStatus: 'FORCE_CHANGE_PASSWORD', Attributes: []}]);
  await makeHandler(c)(event());
  assert.deepEqual(c.calls, [
    'ListUsersCommand',
    'AdminSetUserPasswordCommand',
    'AdminUpdateUserAttributesCommand',
    'AdminLinkProviderForUserCommand',
  ]);
});

test('a failing email_verified update does not block the link', async () => {
  const c = fakeClient([{Username: 'u-3', UserStatus: 'CONFIRMED', Attributes: []}]);
  const send = c.send;
  c.send = async (cmd) => {
    if (cmd.constructor.name === 'AdminUpdateUserAttributesCommand') {
      c.calls.push(cmd.constructor.name);
      throw Object.assign(new Error('not allowed'), {name: 'AccessDeniedException'});
    }
    return send(cmd);
  };
  await makeHandler(c)(event());
  assert.deepEqual(c.calls, ['ListUsersCommand', 'AdminUpdateUserAttributesCommand', 'AdminLinkProviderForUserCommand']);
});

test('CustomMessage_Authentication gets the German code mail', async () => {
  const c = fakeClient([]);
  const e = {triggerSource: 'CustomMessage_Authentication', request: {codeParameter: '{####}'}, response: {}};
  const out = await makeHandler(c)(e);
  assert.equal(out.response.emailSubject, codeMessage().emailSubject);
  assert.ok(out.response.emailMessage.includes('{####}'));
  assert.deepEqual(c.calls, []);
});

test('other CustomMessage triggers pass through untouched', async () => {
  const c = fakeClient([]);
  const e = {triggerSource: 'CustomMessage_ForgotPassword', request: {}, response: {}};
  const out = await makeHandler(c)(e);
  assert.deepEqual(out.response, {});
});

test('parses federated usernames', () => {
  assert.deepEqual(parseFederatedUsername('google_123_456'), {providerName: 'Google', providerUserId: '123_456'});
  assert.throws(() => parseFederatedUsername('nounderscore'));
});

test('findInvitedUser ignores external and unconfirmed users', () => {
  assert.equal(findInvitedUser([{UserStatus: 'EXTERNAL_PROVIDER'}, {UserStatus: 'UNCONFIRMED'}]), undefined);
  assert.equal(findInvitedUser([{UserStatus: 'CONFIRMED', Username: 'x'}]).Username, 'x');
});
