import API from '../request';
import {Applicant, ApplicantAPI, AssessmentsAttribute, ListResponse, Report} from './types';
import {convertAPIApplicant} from './convert';

export const Applicants = () => {
  const list = (
    jobId: string,
    options?: {
      offset?: number;
      limit?: number;
      filter?: {[attribute: string]: {eq: string}};
      orderBy?: string;
    },
  ): Promise<ListResponse> => {
    const {offset, limit, filter, orderBy} = options || {};
    let query = `?jobId=${jobId}`;
    query += `&orderBy=${orderBy || 'Vollständiger Name'}`;
    if (offset !== undefined && limit !== undefined) {
      query += `&offset=${offset}&limit=${limit}`;
    }

    if (filter !== undefined) {
      Object.entries(filter).forEach(([attribute, {eq}]) => {
        query += `&${attribute}[eq]=${eq}`;
      });
    }

    return API.get<{
      applicants: (ApplicantAPI & AssessmentsAttribute)[];
      totalCount: string;
    }>(`/applicants${query}`).then((resp) => {
      return {
        applicants: resp.applicants.map((applicant) =>
          convertAPIApplicant<Applicant & AssessmentsAttribute>(applicant),
        ),
        totalCount: parseInt(resp.totalCount, 10),
      };
    });
  };

  const find = (applicantId: string): Promise<Applicant> => {
    return API.get(`/applicants/${applicantId}`).then(convertAPIApplicant);
  };

  const del = (applicantId: string): Promise<undefined> => {
    return API.del(`/applicants/${applicantId}`);
  };

  const retrieveReport = (applicantId: string, formCategory: string): Promise<Report> => {
    return API.get(`/applicants/${applicantId}/report?formCategory=${formCategory}`);
  };

  const retrievePersonalReport = (applicantId: string, formCategory: string): Promise<Report> => {
    return API.get(`/applicants/${applicantId}/personal-report?formCategory=${formCategory}`);
  };

  const downloadReport = (
    applicantId: string,
    formCategory: string,
    applicantName: string,
    formId?: string,
  ) => {
    const baseUrl = `/applicants/${applicantId}/report/pdf`;
    const params = {formCategory, ...(formId && {formId})};
    const url = baseUrl + '?' + new URLSearchParams(params);
    return API.get(url, {
      responseType: 'arraybuffer',
    }).then(async (buffer) => {
      const blob = new Blob([buffer], {type: 'application/pdf'});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${applicantName}_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    });
  };

  const confirm = (applicantId: string) => {
    return API.put(`/applicants/${applicantId}/confirm`);
  };

  return {list, find, del, retrieveReport, confirm, downloadReport, retrievePersonalReport};
};
