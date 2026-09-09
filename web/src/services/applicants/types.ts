import {FormCategory, FormFieldIntent} from 'services/forms';

export type Applicant = {
  applicantId: string;
  jobId: string;
  email: string;
  name: string;
  screeningExists: boolean;
  attributes: {key: string; value: string}[];
  files?: {key: string; uri: string}[];
  createdAt: string;
};

export type ApplicantAPI = {
  applicantId: string;
  jobId: string;
  screening_exists: boolean;
  attributes: {key: string; value: string}[];
  files?: {key: string; uri: string}[];
  createdAt: string;
};

type AssessmentsField = {
  formId: string;
  formCategory: string;
  formTitle?: string;
  score: number;
};

export type AssessmentsAttribute = {
  assessments: AssessmentsField[];
};

export interface ListResponse {
  applicants: (Applicant & AssessmentsAttribute)[];
  totalCount: number;
}

type FormFieldScore = {
  formFieldId: string;
  jobRequirementId: string;
  rowIndex: number;
  intent: FormFieldIntent;
  label: string;
  aggregatedValues: string[];
  countDistinct: {[key: string]: number};
  formFieldScore: number;
  stdDevFormFieldScore: number;
};

export type Report = {
  rank?: number;
  formCategory?: FormCategory;
  formCategoryScore: number;
  formResults: {
    formId: string;
    formTitle: string;
    formScore: number;
    possibleMinFormScore: number;
    possibleMaxFormScore: number;
    replicas?: {
      formId: string;
      formTitle: string;
      formScore: number;
      stdDevFormScore: number;
      formFieldScores: FormFieldScore[];
    }[];
    formFieldScores: FormFieldScore[];
  }[];
  jobRequirementResults: {
    jobRequirementId: string;
    jobRequirementScore: number;
    requirementLabel: string;
    minValue?: number;
  }[];
};
