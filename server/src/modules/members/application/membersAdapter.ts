import authService from 'shared/infrastructure/services/authService';
import {httpReqHandler} from 'shared/infrastructure/http';
import {DB} from '../infrastructure/repositories';
import {BaseError} from 'application';
import config from 'config';
import logger from 'shared/infrastructure/logger';
import {errorHandler} from 'shared/infrastructure/errorHandler';
import {sendMail} from 'shared/infrastructure/services/mailService';
import templates, {Template} from 'shared/infrastructure/services/mailService/templates';

// Mirrored in web/src/services/members/service.ts; web/src/utils/inviteFailures.ts renders them.
type InviteFailureReason = 'already_exists' | 'unknown';
type InviteFailure = {email: string; reason: InviteFailureReason};

// Cognito error names an admin can act on. The pool is shared by all tenants, so 'already_exists'
// deliberately does not say whether the account belongs to this tenant or another one.
const inviteFailureReason = (error: unknown): InviteFailureReason => {
  const name = error instanceof Error ? error.name : undefined;
  if (name === 'UsernameExistsException') return 'already_exists';
  return 'unknown';
};

export const MembersAdapter = (db: DB) => {
  const create = httpReqHandler(async (req) => {
    const {tenantId} = req.user;
    const tenant = await db.tenants.retrieve(tenantId);
    if (!tenant) throw new BaseError(404, 'Tenant Not Found');

    // A repeated address would otherwise be created once and then reported as already existing.
    const emails = (req.body.emails as string[]).filter(
      (email, i, all) => all.findIndex((e) => e.toLowerCase() === email.toLowerCase()) === i,
    );

    // Each address succeeds or fails on its own: one taken address must not hide that the others
    // were created and mailed, so the admin gets a per-address report instead of one error.
    const results = await Promise.allSettled(
      emails.map(async (email) => {
        await authService.createUser({userRole: 'member', tenantId, email});
        // Our own invitation instead of Cognito's temporary-password mail (JO-75). Best effort:
        // the account exists either way and the admin sees the member in the list.
        await sendMail({
          to: email,
          subject: `Einladung zu ${tenant.tenantName} auf icruiting`,
          html: templates(Template.MemberInvitation, {
            tenantName: tenant.tenantName,
            loginUrl: config.get('webBaseUrl') + '/login',
          }),
        }).catch((error) => logger.error(error));
      }),
    );

    const invited: string[] = [];
    const failed: InviteFailure[] = [];
    const unexpected: Error[] = [];
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        invited.push(emails[i]);
      } else {
        const reason = inviteFailureReason(result.reason);
        if (reason === 'unknown') unexpected.push(result.reason);
        failed.push({email: emails[i], reason});
      }
    });
    // Known reasons are the admin's to fix; anything else is ours and alerts like a 500 would -
    // once per request, since a throttled batch fails every address for the same cause.
    if (unexpected.length) {
      const [first] = unexpected;
      const summary = `${unexpected.length} of ${emails.length} member invites failed`;
      const alert = new BaseError(500, `${summary}: ${first.message}`, first.name);
      alert.stack = first.stack;
      errorHandler.handleError(alert);
    }
    unexpected.slice(1).forEach((error) => logger.error(error));

    return {status: failed.length ? 200 : 201, body: {invited, failed}};
  });

  const list = httpReqHandler(async (req) => {
    const {tenantId, email} = req.user;
    const users = await authService.listUsers(tenantId);
    const withoutMe = users?.filter((user) => user.email !== email);
    return {body: withoutMe};
  });

  const update = httpReqHandler(async (req) => {
    const {user_role: userRole} = req.body;
    const {username: email} = req.params;

    const params = {userRole, email};
    const user = await authService.updateUserRole(params);

    return {body: user};
  });

  const del = httpReqHandler(async (req) => {
    const {tenantId} = req.user;
    const {username: email} = req.params;
    const {Username} = await authService.retrieve(email);
    if (!Username) throw new Error(`User ${email} not found.`);
    await db.formSubmissions.bulkDel(tenantId, Username);
    await authService.deleteUser(email);
    return {};
  });

  return {create, list, update, del};
};
