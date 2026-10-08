import request from 'supertest';
import {internet} from 'faker';
import app from 'infrastructure/http';
import {endConnection, truncateAllTables} from 'infrastructure/db/setup';
import fake from '../testUtils/fake';
import dataGenerator from '../testUtils/dataGenerator';
import authService from 'shared/infrastructure/services/authService';
import logger from 'shared/infrastructure/logger';
import {UsernameExistsException} from '@aws-sdk/client-cognito-identity-provider';

const userExists = () =>
  new UsernameExistsException({message: 'User account already exists', $metadata: {}});

const mockUser = fake.user();
jest.mock('shared/infrastructure/http/middlewares/auth', () => ({
  requireAdmin: jest.fn((req, res, next) => next()),
  requireAuth: jest.fn((req, res, next) => {
    req.user = mockUser;
    next();
  }),
}));

beforeAll(async () => {
  await dataGenerator.insertTenant(mockUser.tenantId);
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await truncateAllTables();
  endConnection();
});

describe('members', () => {
  describe('POST /members', () => {
    it('Returns 201 json response', (done) => {
      request(app)
        .post('/members')
        .send({emails: [internet.email()]})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201, done);
    });

    it('Reports every address as invited', async () => {
      const emails = [internet.email(), internet.email()];
      const resp = await request(app)
        .post('/members')
        .send({emails})
        .set('Accept', 'application/json')
        .expect(201);

      expect(resp.body).toStrictEqual({invited: emails, failed: []});
    });

    it('Creates each address as a member of the inviting tenant', async () => {
      const createUser = jest.spyOn(authService, 'createUser');
      const email = internet.email();

      await request(app)
        .post('/members')
        .send({emails: [email]})
        .expect(201);

      expect(createUser).toHaveBeenCalledWith({
        email,
        tenantId: mockUser.tenantId,
        userRole: 'member',
      });
    });

    it('Invites the rest and reports addresses that already have an account', async () => {
      const [taken, fresh] = [internet.email(), internet.email()];
      jest.spyOn(authService, 'createUser').mockImplementation(async ({email}) => {
        if (email !== taken) return {$metadata: {}};
        throw userExists();
      });

      const resp = await request(app)
        .post('/members')
        .send({emails: [taken, fresh]})
        .set('Accept', 'application/json')
        .expect(200);

      expect(resp.body).toStrictEqual({
        invited: [fresh],
        failed: [{email: taken, reason: 'already_exists'}],
      });
    });

    it('Does not alert for addresses that already have an account', async () => {
      const ntfy = jest.spyOn(logger, 'ntfy');
      jest.spyOn(authService, 'createUser').mockRejectedValue(userExists());

      await request(app)
        .post('/members')
        .send({emails: [internet.email()]})
        .expect(200);

      expect(ntfy).not.toHaveBeenCalled();
    });

    it('Reports unexpected failures as unknown and alerts', async () => {
      const ntfy = jest.spyOn(logger, 'ntfy');
      const email = internet.email();
      jest.spyOn(authService, 'createUser').mockRejectedValue(new Error('Rate exceeded'));

      const resp = await request(app)
        .post('/members')
        .send({emails: [email]})
        .expect(200);

      expect(resp.body).toStrictEqual({invited: [], failed: [{email, reason: 'unknown'}]});
      expect(ntfy).toHaveBeenCalledTimes(1);
      expect(ntfy.mock.calls[0][0]).toMatch(/Rate exceeded/);
    });

    it('Alerts once per request, saying how many addresses failed unexpectedly', async () => {
      const ntfy = jest.spyOn(logger, 'ntfy');
      const fresh = internet.email();
      jest.spyOn(authService, 'createUser').mockImplementation(async ({email}) => {
        if (email === fresh) return {$metadata: {}};
        throw new Error('Rate exceeded');
      });

      await request(app)
        .post('/members')
        .send({emails: [internet.email(), fresh, internet.email()]})
        .expect(200);

      expect(ntfy).toHaveBeenCalledTimes(1);
      expect(ntfy.mock.calls[0][0]).toMatch(/^2 of 3 member invites failed: Rate exceeded/);
    });

    it('Invites an address listed twice only once', async () => {
      const createUser = jest.spyOn(authService, 'createUser');
      const email = internet.email().toLowerCase();

      const resp = await request(app)
        .post('/members')
        .send({emails: [email, email.toUpperCase()]})
        .expect(201);

      expect(resp.body).toStrictEqual({invited: [email], failed: []});
      expect(createUser).toHaveBeenCalledTimes(1);
    });
  });
});
