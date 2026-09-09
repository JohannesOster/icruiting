export type TFormSubmission = {
  formSubmissionId: string;
  applicantId: string;
  tenantId: string;
  formId: string;
  submitterId: string;
  submission: {[formFieldId: string]: number};
};

export type TFormSubmissionRequest = {
  formSubmissionId?: string;
  applicantId: string;
  formId: string;
  submission: {[formFieldId: string]: number};
};
