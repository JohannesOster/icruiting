import {random} from 'faker';
import request from 'supertest';
import app from 'infrastructure/http';
import {endConnection, truncateAllTables} from 'infrastructure/db/setup';
import dataGenerator from '../testUtils/dataGenerator';
import {Form} from 'modules/forms/domain';

// The public form renders only for a tenant with an active subscription;
// without a customer id it falls back to the error view.
let tenantId: string;
let jobId: string;
beforeAll(async () => {
  tenantId = (await dataGenerator.insertTenant(random.uuid(), {stripeCustomerId: 'cus_test'})).id;
  jobId = (await dataGenerator.insertJob(tenantId)).id;
});

afterAll(async () => {
  await truncateAllTables();
  endConnection();
});

describe('forms', () => {
  describe('GET /forms/:formId/html', () => {
    let form: Form;
    beforeAll(async () => {
      form = await dataGenerator.insertForm(tenantId, jobId, 'application');
    });

    it('renders html without crashing', (done) => {
      request(app)
        .get(`/forms/${form.id}/html`)
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });

    it('submits back to the host that served the form', async () => {
      const {text} = await request(app)
        .get(`/forms/${form.id}/html`)
        .set('Accept', 'text/html')
        .expect(200);

      expect(text).toContain(`action="/forms/${form.id}/html"`);
    });
  });
});
