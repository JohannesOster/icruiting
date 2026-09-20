import request from 'supertest';
import app from 'infrastructure/http';
import db, {pgp} from 'infrastructure/db';
import {endConnection, truncateAllTables} from 'infrastructure/db/setup';
import fake from '../testUtils/fake';
import dataGenerator from '../testUtils/dataGenerator';
import {TenantsRepository} from 'modules/tenants/infrastructure/repositories/tenantsRepository';

const mockUser = fake.user();
jest.mock('shared/infrastructure/http/middlewares/auth', () => ({
  requireAdmin: jest.fn((req, res, next) => next()),
  requireAuth: jest.fn((req, res, next) => {
    req.user = mockUser;
    next();
  }),
}));

const tenantsRepo = TenantsRepository({db, pgp});

beforeAll(async () => {
  await dataGenerator.insertTenant(mockUser.tenantId);
});

afterAll(async () => {
  await truncateAllTables();
  endConnection();
});

describe('tenants', () => {
  describe('GET /tenants/:tenantId', () => {
    beforeEach(async () => {
      await tenantsRepo.updateTheme(mockUser.tenantId, null);
    });

    it('returns 200 json response', async () => {
      await request(app)
        .get(`/tenants/${mockUser.tenantId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
    });

    it('returns the tenant of the authenticated user', async () => {
      const resp = await request(app)
        .get(`/tenants/${mockUser.tenantId}`)
        .set('Accept', 'application/json')
        .expect(200);

      expect(resp.body.id).toBe(mockUser.tenantId);
      expect(resp.body.theme).toBeUndefined();
    });

    it('returns a signed url for the theme when the tenant has one', async () => {
      await tenantsRepo.updateTheme(mockUser.tenantId, 'mockTheme.css');

      const resp = await request(app)
        .get(`/tenants/${mockUser.tenantId}`)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(resp.body.id).toBe(mockUser.tenantId);
      expect(resp.body.theme).toBe('https://mock-signed-url.com');
    });
  });
});
