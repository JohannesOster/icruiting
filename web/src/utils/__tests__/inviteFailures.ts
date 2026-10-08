import {inviteFailureMessages} from '../inviteFailures';

describe('inviteFailureMessages', () => {
  it('returns no messages when nothing failed', () => {
    expect(inviteFailureMessages([])).toStrictEqual([]);
  });

  it('groups addresses by reason, one line each', () => {
    const failed = [
      {email: 'a@x.at', reason: 'already_exists'},
      {email: 'b@x.at', reason: 'unknown'},
      {email: 'c@x.at', reason: 'already_exists'},
    ] as const;

    expect(inviteFailureMessages([...failed])).toStrictEqual([
      'Hat bereits ein icruiting-Konto: a@x.at, c@x.at',
      'Unbekannter Fehler, bitte später erneut versuchen: b@x.at',
    ]);
  });
});
