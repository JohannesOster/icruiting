import request from 'supertest';
import app from 'infrastructure/http';
import {endConnection} from 'infrastructure/db/setup';
import fake from '../testUtils/fake';

const mockUser = fake.user();
jest.mock('shared/infrastructure/http/middlewares/auth', () => ({
  requireAdmin: jest.fn((req, res, next) => next()),
  requireAuth: jest.fn((req, res, next) => {
    req.user = mockUser;
    next();
  }),
}));

afterAll(() => endConnection());

describe('tenants', () => {
  describe('POST /tenants', () => {
    it('no longer exists — organisations are created by hand (JO-75)', async () => {
      await request(app)
        .post('/tenants')
        .set('Accept', 'application/json')
        .send({tenantName: 'x', email: 'a@b.c', password: 'p', stripePriceId: 'price'})
        .expect(404);
    });
  });
});
