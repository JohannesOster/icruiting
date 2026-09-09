import React, {FC} from 'react';
import {useFieldArray} from 'react-hook-form';
import {errorsFor} from 'utils/react-hook-form-errors-for';
import {useTheme} from 'styled-components';
import {object, array, string} from 'yup';
import {HeadingS, Box} from 'components';
import {Button, Input, Textarea, Checkbox} from 'components';
import {yupResolver} from '@hookform/resolvers';
import {DnDOptionContainer} from './DnDOptionContainer';
import {Add} from 'icons';
import {EditFormFieldsProps} from '../../EditFormFieldForm';

export const EditOptionsFormFieldsResolver = (acceptEmptyOption = false) =>
  yupResolver(
    object({
      label: string().required('Label ist verpflichtend'),
      options: array().of(
        object({
          ...(!acceptEmptyOption
            ? {
                label: string().required('Option ist verpflichtend auszufüllen oder zu löschen'),
              }
            : {label: string()}),
        }),
      ),
    }),
  );

export const EditOptionsFormFieldsForm: FC<EditFormFieldsProps> = ({register, errors, control}) => {
  const {spacing} = useTheme();

  const {fields, append, remove, move} = useFieldArray({
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
      />
      <Textarea
        name="description"
        label="Beschreibung"
        placeholder="Beschreibung"
        ref={register}
        errors={errorsFor(errors, 'description')}
      />
      <HeadingS style={{marginBottom: `-${spacing.scale300}`}}>Optionen</HeadingS>
      <Box display="grid" rowGap={spacing.scale500}>
        {fields.map((option, idx) => {
          return (
            <DnDOptionContainer
              key={option.id}
              index={idx}
              move={move}
              onDelete={idx > 0 ? remove : undefined}
            >
              <Box flex={1}>
                <Input
                  name={`options[${idx}].label`}
                  placeholder="Item"
                  defaultValue={option.value}
                  ref={register()}
                  errors={errorsFor(errors, `options[${idx}].label`)}
                />
              </Box>
            </DnDOptionContainer>
          );
        })}
      </Box>
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
