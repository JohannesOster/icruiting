jest.mock('config', () => ({
  __esModule: true,
  default: {get: jest.fn((key: string) => `test-${key}`)},
}));

// Mirrors cognito-express 3.x: validate() runs inside `new Promise(async ...)` and reports a
// rejected token as callback(err, null). Anything the callback throws escapes that executor
// as an unhandled rejection - which the process-level error handler turns into a 500 alert.
const mockValidate = jest.fn();
jest.mock('cognito-express', () =>
  jest.fn().mockImplementation(() => ({
    validate: (token: string, callback: (err: Error | null, payload: any) => void) =>
      new Promise(async () => {
        try {
          callback(null, mockValidate(token));
        } catch (error) {
          callback(error as Error, null);
        }
      }),
  })),
);

import {BaseError} from 'application';
import {AuthService} from './authService';

describe('AuthService.validateToken', () => {
  const unhandled = jest.fn();

  beforeAll(() => {
    process.on('unhandledRejection', unhandled);
  });

  afterAll(() => {
    process.off('unhandledRejection', unhandled);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const flush = () => new Promise((resolve) => setImmediate(resolve));

  it('maps the id token payload to the user', async () => {
    mockValidate.mockReturnValue({
      sub: 'user-1',
      email: 'a@b.at',
      'custom:tenant_id': 'tenant-1',
      'custom:user_role': 'admin',
    });

    await expect(AuthService().validateToken('token')).resolves.toEqual({
      userId: 'user-1',
      email: 'a@b.at',
      tenantId: 'tenant-1',
      userRole: 'admin',
    });
  });

  it('rejects an invalid token with 401 and nothing else', async () => {
    mockValidate.mockImplementation(() => {
      throw new TypeError('Not a valid JWT token');
    });

    const result = AuthService().validateToken('garbage');

    await expect(result).rejects.toBeInstanceOf(BaseError);
    await expect(result).rejects.toMatchObject({statusCode: 401, message: 'Not a valid JWT token'});
    await flush();
    expect(unhandled).not.toHaveBeenCalled();
  });
});
