import {ChangeEvent, FocusEvent} from 'react';

export interface CheckboxProps {
  name?: string;
  label?: string;
  autoFocus?: boolean;
  description?: string;
  required?: boolean;
  errors?: string[];
  options: {label: string; value: string}[];
  value?: string[];
  defaultValue?: string[];
  disabled?: boolean;
  readOnly?: boolean;
  indeterminate?: boolean;
  onBlur?(event: FocusEvent<HTMLInputElement>): void;
  onFocus?(event: FocusEvent<HTMLInputElement>): void;
  onChange?(event: ChangeEvent<HTMLInputElement>): void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface LabelProps {
  error: boolean;
}

export interface DescriptionProps {
  error: boolean;
}
