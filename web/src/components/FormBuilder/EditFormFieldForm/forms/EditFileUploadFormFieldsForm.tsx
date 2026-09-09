import React from 'react';
import {Input, Textarea, Select, Checkbox} from 'components';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers';
import {EditFormFieldsProps} from '../EditFormFieldForm';

export const EditFileUploadFormFieldsResolver = yupResolver(
  object({label: string().required('Label ist verpflichtend')}),
);
export const EditFileUploadFormFieldsForm: React.FC<EditFormFieldsProps> = ({register, errors}) => {
  const acceptMap = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPEG',
  };

  const acceptOptions = Object.entries(acceptMap).map(([key, value]) => ({
    label: value,
    value: key,
  }));

  return (
    <>
      <Input
        name="label"
        label="Label"
        placeholder="Label"
        ref={register}
        errors={errorsFor(errors, 'label')}
        autoFocus={true}
      />
      <Textarea
        name="description"
        label="Beschreibung"
        placeholder="Beschreibung"
        ref={register}
        errors={errorsFor(errors, 'description')}
      />
      <Select
        name="accept"
        label="Dateiformat"
        options={acceptOptions}
        ref={register}
        errors={errorsFor(errors, 'description')}
      />
      <Checkbox
        name="required"
        ref={register}
        options={[{label: 'Verpflichtend', value: 'required'}]}
      />
    </>
  );
};
