import {FormFieldIntent} from 'services';

export type TRanking = {
  applicantId: string;
  score: number;
  rank: number;
  submissions: any[];
  result: {
    [formFieldId: string]: {
      label: string;
      intent: FormFieldIntent;
      value: string | string[] | number;
    };
  };
}[];

export type TRankingAPI = {
  applicantId: string;
  score: string;
  rank: string;
  submissionsCount: string;
  submissions: any[];
  result: {
    [formFieldId: string]: {
      label: string;
      intent: FormFieldIntent;
      value: string;
    };
  };
}[];
