import {TForm, TFormRequest} from './types';
import API from '../request';

export const Forms = () => {
  const list = (jobId?: string): Promise<TForm[]> => {
    const query = jobId ? `?jobId=${jobId}` : '';
    return API.get(`/forms${query}`);
  };

  const find = (formId: string): Promise<TForm> => {
    return API.get(`/forms/${formId}`);
  };

  const exportJSON = (formId?: string): Promise<TForm[]> => {
    return API.get(`/forms/${formId}/export`).then((response) => {
      const blob = new Blob([JSON.stringify(response)], {
        type: 'application/json;charset=utf-8',
      });

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'form.json';
      document.body.appendChild(a);
      a.click();
      a.remove();

      return response;
    });
  };

  const del = (formId: string): Promise<undefined> => {
    return API.del(`/forms/${formId}`);
  };

  const create = (form: TFormRequest): Promise<TForm> => {
    return API.post('/forms', {body: form});
  };

  const update = (form: TFormRequest): Promise<TForm> => {
    return API.put(`/forms/${form.formId}`, {body: form});
  };

  return {list, find, del, create, update, exportJSON};
};
