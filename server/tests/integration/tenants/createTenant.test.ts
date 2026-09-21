import request from 'supertest';
import app from 'infrastructure/http';
import faker from 'faker';
import db from 'infrastructure/db';
import {endConnection, truncateAllTables} from 'infrastructure/db/setup';
import fake from '../testUtils/fake';
import {CognitoUserAttribute} from 'amazon-cognito-identity-js';

const mockUser = fake.user();
jest.mock('shared/infrastructure/http/middlewares/auth', () => ({
  requireAdmin: jest.fn((req, res, next) => next()),
  requireAuth: jest.fn((req, res, next) => {
    req.user = mockUser;
    next();
  }),
}));

jest.mock('amazon-cognito-identity-js', () => ({
  CognitoUserAttribute: jest.fn().mockImplementation((args: any) => args),
  CognitoUserPool: jest.fn().mockImplementation(() => ({
    signUp: (
      email: string,
      _passwort: string,
      attributes: CognitoUserAttribute[],
      _validationData: CognitoUserAttribute[],
      callback: (error: any, result: any) => void,
    ) => {
      callback(null, {
        User: {
          Username: email,
          Attributes: attributes,
        },
      });
    },
  })),
}));

jest.mock('@aws-sdk/client-cognito-identity-provider', () => ({
  CognitoIdentityServiceProvider: jest.fn().mockImplementation(() => ({
    adminCreateUser: (parmas: {
      UserPoolId: string;
      Username: string;
      UserAttributes: {Name: string; Value: string}[];
    }) => ({
      promise: () =>
        Promise.resolve({
          User: {
            Username: parmas.Username,
            Attributes: parmas.UserAttributes,
          },
        }),
    }),
    listUsers: () => ({
      promise: () =>
        Promise.resolve({
          Users: [
            {
              Username: faker.internet.email(),
              Attributes: [
                {Name: 'email', Value: faker.internet.email()},
                {Name: 'custom:tenant_id', Value: mockUser.tenantId},
              ],
            },
          ],
        }),
    }),
    adminDeleteUser: () => ({
      promise: () => Promise.resolve({}),
    }),
  })),
}));

afterAll(async () => {
  await truncateAllTables();
  endConnection();
});

describe('tenants', () => {
  describe('POST /tenants', () => {
    const params = (tenant = fake.tenant()) => ({
      ...tenant,
      email: faker.internet.email(),
      password: faker.internet.password(),
      stripePriceId: faker.random.uuid(),
    });

    it('returns 403 because self-service signup is disabled', async () => {
      const {body} = await request(app)
        .post('/tenants')
        .set('Accept', 'application/json')
        .send(params())
        .expect('Content-Type', /json/)
        .expect(403);

      expect(body.message).toMatch(/Registrierung neuer Organisationen ist deaktiviert/);
    });

    it('returns 403 even without params (no validation runs first)', async () => {
      await request(app).post('/tenants').send({}).set('Accept', 'application/json').expect(403);
    });

    it('does not create a tenant', async () => {
      const tenant = fake.tenant();
      await request(app).post('/tenants').set('Accept', 'application/json').send(params(tenant));

      const {count} = await db.one(
        'SELECT count(*) FROM tenant WHERE tenant_name=$1',
        tenant.tenantName,
      );
      expect(+count).toBe(0);
    });
  });
});
