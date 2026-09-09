import React from 'react';
import {ComponentToEdit} from '../types';
import {Button, DialogBody, DialogFooter, Typography} from 'components';
import {
  EditInputFormFieldsForm,
  EditRatingGroupFormFieldsForm,
  EditFileUploadFormFieldsForm,
  EditOptionsFormFieldsForm,
  EditACRatingGroupFormFieldsForm,
  EditSectionHeaderFormFieldsForm,
  EditTextareaFormFieldsForm,
  EditSectionHeaderFormFieldsResolver,
  EditInputFormFieldsResolver,
  EditTextareaFormFieldsResolver,
  EditRatingGroupFormFieldsResolver,
  EditACRatingGroupFormFieldsResolver,
  EditFileUploadFormFieldsResolver,
  EditOptionsFormFieldsResolver,
} from './forms';
import {FormCategory, TJob} from 'services';
import styled from 'styled-components';
import {yupResolver} from '@hookform/resolvers';
import {useForm, UseFormMethods} from 'react-hook-form';

const FormFieldsContainer = styled.form`
  display: grid;
  grid-row-gap: ${({theme}) => theme.spacing.scale300};
  width: 70vw;
  min-width: 250px;
`;

export type EditFormFieldsProps = {
  register: UseFormMethods['register'];
  errors: UseFormMethods['errors'];
  control: UseFormMethods['control'];
  initialValues: any;
};

type Props = {
  /** The component and props to edit */
  componentToEdit: ComponentToEdit;
  /** A handler for form submission
   * @params values the values from the edit form
   */
  onSubmit: (values: any) => void;
  onCancel: () => void;
  /** Category of the form that currently edited (relevant for AC vs screening) */
  formCategory: FormCategory;
  /** The job this form refers to (relevant for AC) */
  job: TJob;
};

export const EditFormFieldForm: React.FC<Props> = ({
  componentToEdit,
  onSubmit,
  onCancel,
  formCategory,
  job,
}) => {
  const {component, props} = componentToEdit;

  let FormFields: React.FC<any>;
  let resolver: ReturnType<typeof yupResolver>;
  let initialValues = {...props};

  let _onSubmit = (values) => {
    onSubmit(values);
  };

  switch (component) {
    case 'section_header':
      FormFields = EditSectionHeaderFormFieldsForm;
      resolver = EditSectionHeaderFormFieldsResolver;
      break;
    case 'input':
      FormFields = EditInputFormFieldsForm;
      resolver = EditInputFormFieldsResolver;
      break;
    case 'textarea':
      FormFields = EditTextareaFormFieldsForm;
      resolver = EditTextareaFormFieldsResolver;
      break;
    case 'rating_group':
      if (['assessment', 'onboarding'].includes(formCategory)) {
        FormFields = EditACRatingGroupFormFieldsForm;
        initialValues.jobRequirementOptions = (job.jobRequirements || []).map((req) => ({
          label: req.requirementLabel,
          value: req.jobRequirementId,
        }));
        resolver = EditACRatingGroupFormFieldsResolver;
      } else {
        FormFields = EditRatingGroupFormFieldsForm;
        resolver = EditRatingGroupFormFieldsResolver;
      }
      break;
    case 'file_upload':
      FormFields = EditFileUploadFormFieldsForm;
      resolver = EditFileUploadFormFieldsResolver;
      break;
    case 'checkbox':
    case 'radio':
    case 'select':
      FormFields = EditOptionsFormFieldsForm;
      resolver = EditOptionsFormFieldsResolver(component === 'select');
      _onSubmit = (values) => {
        // Add missing "value" to option
        values.options = values.options.map((option) => ({...option, value: option.label}));
        onSubmit(values);
      };

      break;
    default:
      FormFields = () => <Typography>Diese Funktion wird noch nicht unterstützt</Typography>;
  }

  const {register, formState, errors, control, handleSubmit} = useForm({
    mode: 'onChange',
    criteriaMode: 'all',
    defaultValues: props,
    resolver,
  });

  return (
    <form onSubmit={handleSubmit(_onSubmit)}>
      <DialogBody>
        <FormFieldsContainer>
          <FormFields
            register={register}
            errors={errors}
            formState={formState}
            job={job}
            control={control}
            initialValues={initialValues}
          />
        </FormFieldsContainer>
      </DialogBody>
      <DialogFooter>
        <Button kind="secondary" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={!(formState.isValid && formState.isDirty)}>
          Speichern
        </Button>
      </DialogFooter>
    </form>
  );
};
