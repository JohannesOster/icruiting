import React from 'react';
import {Input, Textarea, Checkbox} from 'components';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {object, string} from 'yup';
import {yupResolver} from '@hookform/resolvers';
import {EditFormFieldsProps} from '../EditFormFieldForm';

export const EditInputFormFieldsResolver = yupResolver(
  object({label: string().required('Label ist verpflichtend')}),
);
export const EditInputFormFieldsForm: React.FC<EditFormFieldsProps> = ({
  register,
  errors,
  initialValues,
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
      {initialValues.type !== 'date' && (
        <Input
          name="placeholder"
          label="Placeholder"
          placeholder="Placeholder"
          ref={register}
          errors={errorsFor(errors, 'placeholder')}
        />
      )}
      <Textarea
        name="description"
        label="Beschreibung"
        placeholder="Beschreibung"
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
