import {TFormSubmission, TFormSubmissionRequest} from './types';
import API from '../request';

export const FormSubmissions = () => {
  const find = (
    formId: string,
    applicantId: string,
  ): Promise<TFormSubmission | undefined> => {
    return API.get(`/form-submissions/${formId}/${applicantId}`);
  };

  const create = (
    submission: TFormSubmissionRequest,
  ): Promise<TFormSubmission> => {
    return API.post('/form-submissions', {body: submission});
  };

  const update = (
    submission: TFormSubmissionRequest,
  ): Promise<TFormSubmission> => {
    const {formSubmissionId} = submission;
    return API.put(`/form-submissions/${formSubmissionId}`, {
      body: submission,
    });
  };

  const del = (formSubmissionId: string) => {
    return API.del(`/form-submissions/${formSubmissionId}`);
  };

  const exportCSV = (jobId: string, formCategory: string) => {
    return API.get(
      `/form-submissions?jobId=${jobId}&formCategory=${formCategory}`,
    ).then((rows) => {
      const delimiter = ';';
      const csvContent = rows.map((row) => row.join(delimiter)).join('\n');
      const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `ic-${formCategory}-export.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  };

  return {find, create, update, del, exportCSV};
};
