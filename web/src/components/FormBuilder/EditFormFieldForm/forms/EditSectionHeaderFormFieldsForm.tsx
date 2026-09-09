import React from 'react';
import {Input, Textarea} from 'components';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers';
import {EditFormFieldsProps} from '../EditFormFieldForm';

export const EditSectionHeaderFormFieldsResolver = yupResolver(
  object({label: string().required('Label ist verpflichtend')}),
);

export const EditSectionHeaderFormFieldsForm: React.FC<EditFormFieldsProps> = ({
  register,
  errors,
}) => {
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
    </>
  );
};
