import {InviteFailure} from 'services/members/service';

const reasonLabels: {[reason in InviteFailure['reason']]: string} = {
  already_exists: 'Hat bereits ein icruiting-Konto',
  unknown: 'Unbekannter Fehler, bitte später erneut versuchen',
};

/** One line per failure reason, listing the affected addresses. */
export const inviteFailureMessages = (failed: InviteFailure[]): string[] =>
  Object.entries(reasonLabels)
    .map(([reason, label]) => {
      const emails = failed.filter((f) => f.reason === reason).map((f) => f.email);
      return emails.length ? `${label}: ${emails.join(', ')}` : '';
    })
    .filter(Boolean);
