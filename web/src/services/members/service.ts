import API from '../request';

export const Members = () => {
  const list = () => {
    return API.get('/members');
  };

  const create = (emails: string[]) => {
    return API.post('/members', {body: {emails}});
  };

  const updateUserRole = (email: string, userRole: string) => {
    return API.put(`/members/${email}`, {body: {user_role: userRole}});
  };

  const del = (email: string) => {
    return API.del(`/members/${email}`);
  };

  return {create, list, updateUserRole, del};
};
