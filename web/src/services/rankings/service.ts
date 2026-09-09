import API from '../request';
import {convertAPIRanking} from './convert';
import {TRanking, TRankingAPI} from './types';

export const Rankings = () => {
  const find = (jobId: string, formCategory: string): Promise<TRanking> => {
    return API.get<TRankingAPI>(
      `/rankings/${jobId}?formCategory=${formCategory}`,
    ).then(convertAPIRanking);
  };

  return {find};
};
