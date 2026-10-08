import API from '../request';

/** Mirrors the server's members adapter: why one address of an invite batch failed. */
export type InviteFailure = {email: string; reason: 'already_exists' | 'unknown'};

export const Members = () => {
  const list = () => {
    return API.get('/members');
  };

  const create = (emails: string[]) => {
    return API.post<{invited: string[]; failed: InviteFailure[]}>('/members', {body: {emails}});
  };

  const updateUserRole = (email: string, userRole: string) => {
    return API.put(`/members/${email}`, {body: {user_role: userRole}});
  };

  const del = (email: string) => {
    return API.del(`/members/${email}`);
  };

  return {create, list, updateUserRole, del};
};
