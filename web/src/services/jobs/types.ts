export type TJobRequest = {
  jobId?: string;
  jobTitle: string;
  jobRequirements: {
    jobRequirementId?: string;
    requirementLabel: string;
    minValue?: string;
  }[];
};

export type JobRequirement = {
  requirementLabel: string;
  jobRequirementId: string;
  minValue?: string;
};

export type TJob = {
  jobId: string;
  jobTitle: string;
  jobRequirements: JobRequirement[];
};

export type TReport = {
  jobId: string;
  tenantId: string;
  formFields: string[];
};
