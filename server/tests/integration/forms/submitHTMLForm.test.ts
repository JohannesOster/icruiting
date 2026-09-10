import {random, internet} from 'faker';
import request from 'supertest';
import app from 'infrastructure/http';
import {endConnection, truncateAllTables} from 'infrastructure/db/setup';
import dataGenerator from '../testUtils/dataGenerator';
import Mail from 'nodemailer/lib/mailer';
import {Form} from 'modules/forms/domain';
import logger from 'shared/infrastructure/logger';

jest.mock('shared/infrastructure/services/mailService/mailService', () => ({
  sendMail: jest.fn((options: Mail.Options) => Promise.resolve({})),
}));

let tenantId: string;
let jobId: string;
beforeAll(async () => {
  tenantId = (await dataGenerator.insertTenant(random.uuid())).id;
  jobId = (await dataGenerator.insertJob(tenantId)).id;
});

afterAll(async () => {
  await truncateAllTables();
  endConnection();
});

describe('forms', () => {
  describe('POST /forms/:formId/html', () => {
    let form: Form;
    beforeAll(async () => {
      form = await dataGenerator.insertForm(tenantId, jobId, 'application');
    });

    it('renders html without crashing', (done) => {
      request(app)
        .post(`/forms/${form.id}/html`)
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });

    it('renders html without crashing', (done) => {
      request(app)
        .post(`/forms/${form.id}/html`)
        .field(form.formFields[0].id, internet.email())
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(200, done);
    });

    it('logs the embedding page on submit too', async () => {
      const info = jest.spyOn(logger, 'info');

      await request(app)
        .post(`/forms/${form.id}/html`)
        .field(form.formFields[0].id, internet.email())
        .set('Accept', 'text/html')
        .set('Referer', 'https://kunde.at/bewerben')
        .expect(200);

      expect(info).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'public_form_request',
          method: 'POST',
          formId: form.id,
          referer: 'https://kunde.at/bewerben',
        }),
        'public form request',
      );

      info.mockRestore();
    });
  });
});
