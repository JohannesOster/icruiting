import db, {pgp} from 'infrastructure/db';
import fake, {TenantOverrides} from './fake';
import {random} from 'faker';
import {DBJob, JobsRepository} from 'modules/jobs/infrastructure/repositories/jobsRepository';
import {FormsRepository} from 'modules/forms/infrastructure/db/repositories';
import {FormSubmissionsRepository} from 'modules/formSubmissions/infrastructure/repositories/formSubmissions';
import {TenantsRepository} from 'modules/tenants/infrastructure/repositories/tenantsRepository';
import {ApplicantsRepository} from 'modules/applicants/infrastructure/repositories/applicantsRepository';
import {FormCategory, createForm} from 'modules/forms/domain';
import {Form} from 'modules/forms/infrastructure/db/repositories/forms';
import {JobRequirement, createJob} from 'modules/jobs/domain';
import jobsMapper from 'modules/jobs/mappers/jobsMapper';
import {formsMapper} from 'modules/forms/mappers';

const tenantsRepo = TenantsRepository({db, pgp});
const jobsRepo = JobsRepository({db, pgp});
const formsRepo = FormsRepository({db, pgp});
const formSubmissionsRepo = FormSubmissionsRepository({db, pgp});
const applicantsRepo = ApplicantsRepository({db, pgp});

const dataGenerator = {
  insertTenant: (tenantId: string = random.uuid(), overrides: TenantOverrides = {}) => {
    const tenant = fake.tenant(tenantId, overrides);
    return tenantsRepo.create(tenant);
  },
  insertJob: (tenantId: string, requirements: JobRequirement[] | undefined = undefined) => {
    const job = fake.job(tenantId, requirements);
    return jobsRepo.create(job);
  },
  insertForm: (
    tenantId: string,
    jobId: string,
    formCategory: FormCategory,
    options?: {[key: string]: any},
  ) => {
    let form: Form;
    switch (formCategory) {
      case 'application': {
        form = fake.applicationForm(tenantId, jobId);
        break;
      }
      case 'screening': {
        form = fake.screeningForm(tenantId, jobId);
        break;
      }
      case 'assessment': {
        form = fake.assessmentForm(tenantId, jobId);
        break;
      }
      case 'onboarding': {
        form = fake.onboardingForm(tenantId, jobId, options?.replicaOf);
        break;
      }
    }

    return formsRepo.create(form);
  },
  /** A form with no formFields — legal via POST /forms and by deleting the last field via PUT */
  insertFieldlessForm: (tenantId: string, jobId: string) => {
    const form = createForm({
      tenantId,
      jobId,
      formCategory: 'assessment',
      formTitle: random.words(),
      formFields: [],
    });
    return formsRepo.create(formsMapper.toPersistance(form));
  },
  insertApplicant: (tenantId: string, jobId: string, formFieldIds: string[]) => {
    const applicant = fake.applicant(tenantId, jobId, formFieldIds);
    return applicantsRepo.create(applicant);
  },
  insertFormSubmission: (
    tenantId: string,
    applicantId: string,
    submitterId: string,
    formId: string,
    formFieldIds: string[],
  ) => {
    const formSubmission = fake.formSubmission(
      tenantId,
      applicantId,
      submitterId,
      formId,
      formFieldIds,
    );
    return formSubmissionsRepo.create(formSubmission);
  },
};

export default dataGenerator;
