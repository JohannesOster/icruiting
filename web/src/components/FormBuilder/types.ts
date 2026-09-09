import {ComponentType} from 'react';

export type FormFieldComponent =
  | 'section_header'
  | 'input'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file_upload'
  | 'rating_group';

export type DnDItem = {
  id: string;
  formFieldId?: string;
  type: string; // React-dnd type identifier
  /* The index of the current item in its list.
   * -1 if it isn't part of a list */
  rowIndex: number;
  component: FormFieldComponent;
  as: ComponentType<any>;
  props: {[key: string]: any};
  label?: string;
  icon?: ComponentType<any>;
  deletable?: boolean;
  editable?: boolean;
};

export type ComponentToEdit = {
  id: string;
  component: FormFieldComponent;
  props: {[key: string]: any};
};
