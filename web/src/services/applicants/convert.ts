import {Applicant, ApplicantAPI} from './types';

export const convertAPIApplicant = <T = Applicant>(
  applicant: ApplicantAPI,
): T => {
  const nameKey = 'Vollständiger Name';
  const emailKey = 'E-Mail-Adresse';

  const attrTuple = applicant.attributes?.reduce(
    (acc, curr) => {
      if (curr.key === nameKey) acc.name = curr.value;
      else if (curr.key === emailKey) acc.email = curr.value;
      return acc;
    },
    {name: '', email: ''},
  );

  return {
    ...applicant,
    name: attrTuple?.name,
    email: attrTuple?.email,
  } as unknown as T;
};
