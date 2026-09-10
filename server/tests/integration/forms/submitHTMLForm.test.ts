import {random, internet, name} from 'faker';
import request from 'supertest';
import app from 'infrastructure/http';
import db, {pgp} from 'infrastructure/db';
import {endConnection, truncateAllTables} from 'infrastructure/db/setup';
import dataGenerator from '../testUtils/dataGenerator';
import Mail from 'nodemailer/lib/mailer';
import {Form} from 'modules/forms/domain';
import logger from 'shared/infrastructure/logger';
import {ApplicantsRepository} from 'modules/applicants/infrastructure/repositories/applicantsRepository';

jest.mock('shared/infrastructure/services/mailService/mailService', () => ({
  sendMail: jest.fn((options: Mail.Options) => Promise.resolve({})),
}));

// Submissions are only accepted for tenants with an active subscription; keep Stripe out of it.
jest.mock('shared/infrastructure/services/paymentService', () => ({
  __esModule: true,
  default: {subscriptions: {listActive: jest.fn(() => Promise.resolve([{id: 'sub_test'}]))}},
}));

const applicantsRepo = ApplicantsRepository({db, pgp});

/**
 * Builds a multipart/form-data body the way a browser does, including the part an untouched
 * `<input type="file">` still produces: `filename=""`, `application/octet-stream`, zero bytes.
 */
const multipartBody = (
  boundary: string,
  parts: {name: string; value?: string; emptyFile?: boolean}[],
) => {
  const lines = parts.flatMap(({name: fieldName, value, emptyFile}) =>
    emptyFile
      ? [
          `--${boundary}`,
          `Content-Disposition: form-data; name="${fieldName}"; filename=""`,
          'Content-Type: application/octet-stream',
          '',
          '',
        ]
      : [`--${boundary}`, `Content-Disposition: form-data; name="${fieldName}"`, '', value ?? ''],
  );
  return [...lines, `--${boundary}--`, ''].join('\r\n');
};

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

    it('accepts a submission that leaves an optional file_upload empty', async () => {
      const fieldByComponent = (component: string) =>
        form.formFields.find((field) => field.component === component)!;
      const fieldByLabel = (label: string) =>
        form.formFields.find((field) => field.label === label)!;
      const fileField = fieldByComponent('file_upload');
      expect(fileField.required).toBeFalsy();

      const boundary = '----icruitingTestBoundary';
      const body = multipartBody(boundary, [
        {name: fieldByLabel('E-Mail-Adresse').id, value: internet.email()},
        {name: fieldByLabel('Vollständiger Name').id, value: name.findName()},
        {name: fileField.id, emptyFile: true},
      ]);

      const resp = await request(app)
        .post(`/forms/${form.id}/html`)
        .set('Accept', 'text/html')
        .set('Content-Type', `multipart/form-data; boundary=${boundary}`)
        .send(body)
        .expect('Content-Type', /html/)
        .expect(200);

      expect(resp.text).toContain('Bewerbung erfolgreich abgeschickt!');
      expect(resp.text).not.toContain('Ein Fehler ist aufgetreten');

      const {applicants} = await applicantsRepo.list({tenantId, jobId, userId: random.uuid()});
      expect(applicants).toHaveLength(1);
      expect(applicants[0].attributes.map(({formFieldId}) => formFieldId)).not.toContain(
        fileField.id,
      );
    });
  });
});
