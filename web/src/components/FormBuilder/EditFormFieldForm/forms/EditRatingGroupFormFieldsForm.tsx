import React from 'react';
import {Box, HeadingS} from 'components';
import {Button, Checkbox, Input, Select, Textarea} from 'components';
import {useFieldArray} from 'react-hook-form';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {yupResolver} from '@hookform/resolvers';
import {object, array, string, mixed, number} from 'yup';
import {Add, Trash} from 'icons';
import {useTheme} from 'styled-components';
import {FormFieldIntent} from 'services';
import {EditFormFieldsProps} from '../EditFormFieldForm';

export const EditRatingGroupFormFieldsResolver = yupResolver(
  object({
    label: string().required('Label ist verpflichtend'),
    defaultValue: mixed().transform((val) => (val ? val : null)),
    options: array().of(
      object({
        label: string().required('Option ist verpflichtend auszufüllen oder zu löschen'),
        value: number().typeError('Geben sie einen eindeutigen Zahlenwert an!'),
      }),
    ),
  }),
);

export const EditRatingGroupFormFieldsForm: React.FC<EditFormFieldsProps> = ({
  register,
  errors,
  control,
}) => {
  const {spacing} = useTheme();

  const {fields, append, remove} = useFieldArray({
    control,
    name: 'options',
  });

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
        name="intent"
        label="Absicht"
        ref={register}
        options={[
          {label: 'auszählen', value: FormFieldIntent.countDistinct},
          {label: 'auswerten', value: FormFieldIntent.sumUp},
        ]}
      />
      <Select
        name="visibility"
        label="Sichtbarkeit"
        ref={register}
        defaultValue={'all'}
        options={[
          {label: 'Alle', value: 'all'},
          {label: 'Nur Administratoren', value: 'admin'},
        ]}
      />
      <Select
        name="defaultValue"
        label="Default"
        ref={register}
        defaultValue={'default'}
        options={[
          {label: undefined, value: null},
          ...fields.map(({label, value}) => ({
            label,
            value,
          })),
        ]}
      />
      <HeadingS style={{marginBottom: `-${spacing.scale300}`}}>Optionen (Label, Wert)</HeadingS>
      {fields.map((option, idx) => {
        return (
          <Box
            display="grid"
            gridAutoFlow="column"
            gridTemplateColumns="1fr 1fr 30px"
            alignItems="center"
            columnGap={spacing.scale300}
            key={option.id}
          >
            <input
              defaultValue={option.optionId}
              name={`options[${idx}].optionId`}
              ref={register}
              hidden
            />
            <Input
              name={`options[${idx}].label`}
              placeholder="Label"
              defaultValue={option.label}
              ref={register()}
              errors={errorsFor(errors, `options[${idx}].label`)}
            />
            <Input
              name={`options[${idx}].value`}
              placeholder="Wert"
              defaultValue={option.value}
              ref={register()}
              type="number"
              step="0.001"
              errors={errorsFor(errors, `options[${idx}].value`)}
            />

            {/* There must be at least 2 options */}
            {idx > 1 && <Trash onClick={() => remove(idx)} />}
          </Box>
        );
      })}
      <div>
        <Button kind="minimal" onClick={() => append({label: '', value: ''})}>
          <Add style={{marginRight: spacing.scale200}} fill="currentColor" />
          Neues Item
        </Button>
      </div>
      <Checkbox
        name="required"
        ref={register}
        options={[{label: 'Verpflichtend', value: 'required'}]}
      />
    </>
  );
};
