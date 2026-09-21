import {BaseError} from 'application';
import authService from 'shared/infrastructure/services/authService';
import {catchAsync} from '../httpReqHandler';

export const NOT_INVITED_MESSAGE =
  'Du wurdest noch nicht eingeladen. Bitte deine:n Administrator:in um eine Einladung.';

export const requireAuth = catchAsync(async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) throw new BaseError(401, 'Missing Authorization header');

  const token = authHeader.split(' ')[1];
  if (!token) throw new BaseError(401, 'Invalid Token');

  await authService
    .validateToken(token)
    .then((user) => {
      // A valid token without a tenant belongs to nobody's organisation (legacy account or a
      // federated login that slipped past the PreSignUp trigger) — nothing here is for them.
      if (!user.tenantId) throw new BaseError(403, NOT_INVITED_MESSAGE);
      req.user = user;
      next();
    })
    .catch(next);
});

export const requireAdmin = catchAsync((req, res, next) => {
  const userRole = req.user.userRole;
  if (userRole !== 'admin') throw new BaseError(403, 'Admin required');
  next();
});
