import {FormField} from 'services';
import {ItemTypes} from './DnD';
import {DnDItem, FormFieldComponent} from './types';
import {stringToComponent} from './utils';

export const converter = {
  toDnDItem: (formField: FormField): DnDItem => {
    const _formField: DnDItem = {
      type: ItemTypes.FORM_FIELD,
      id: formField.formFieldId,
      formFieldId: formField.formFieldId,
      component: formField.component as FormFieldComponent,
      as: stringToComponent(formField.component),
      rowIndex: formField.rowIndex,
      props: {
        ...formField.props,
        description: formField.description,
        label: formField.label,
        name: formField.formFieldId,
        placeholder: formField.placeholder,
        defaultValue: formField.defaultValue,
        options: formField.options,
        required: !!formField.required,
        visibility: formField.visibility,
      },
      editable: formField.editable,
      deletable: formField.deletable,
    };

    if (formField.required) _formField.props.required = !!formField.required;
    if (formField.options) _formField.props.options = formField.options;
    if (formField.jobRequirementId) _formField.props.jobRequirementId = formField.jobRequirementId;
    if (formField.intent) _formField.props.intent = formField.intent;

    return _formField;
  },
  toAPIFormField: (formField: DnDItem, idx: number) => {
    const {
      label,
      placeholder,
      description,
      defaultValue,
      options,
      required,
      jobRequirementId,
      intent,
      visibility,
      ...props
    } = formField.props;

    return {
      formFieldId: formField.formFieldId,
      component: formField.component,
      rowIndex: formField.rowIndex,
      label,
      placeholder,
      description,
      defaultValue,
      options,
      required: !!required,
      editable: formField.editable,
      deletable: formField.deletable,
      jobRequirementId,
      intent,
      visibility,
      props,
    };
  },
};
